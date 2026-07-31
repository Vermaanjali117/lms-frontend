import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}
@Component({
    selector: 'app-learn',
    imports: [CommonModule, RouterLink],
    templateUrl: './learn.component.html',
    styleUrl: './learn.component.css'
})
export class LearnComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private http = inject(HttpClient);
    private sanitizer = inject(DomSanitizer);
    private apiUrl = environment.apiUrl;

    course = signal<any>(null);
    currentLesson = signal<any>(null);
    isLoading = signal(true);
    completedLessons = signal<string[]>([]);
    progress = signal(0);

    // Quiz signals
    showQuiz = signal(false);
    isGeneratingQuiz = signal(false);
    quiz = signal<QuizQuestion[]>([]);
    selectedAnswers = signal<number[]>([]);
    quizSubmitted = signal(false);
    quizScore = signal(0);

    ngOnInit() {
        const courseId = this.route.snapshot.paramMap.get('id');
        if (courseId) {
            this.loadCourse(courseId);
            this.loadProgress(courseId);
        }
    }

    loadCourse(courseId: string) {
        this.http.get<any>(`${this.apiUrl}/courses/${courseId}`)
            .subscribe({
                next: (res) => {
                    this.course.set(res.data);
                    if (res.data.sections?.length > 0 &&
                        res.data.sections[0].lessons?.length > 0) {
                        this.currentLesson.set(res.data.sections[0].lessons[0]);
                    }
                    this.isLoading.set(false);
                },
                error: () => this.isLoading.set(false)
            });
    }

    loadProgress(courseId: string) {
        this.http.get<any>(`${this.apiUrl}/progress/course/${courseId}`)
            .subscribe({
                next: (res) => {
                    this.completedLessons.set(res.data?.completedLessons || []);
                    this.progress.set(res.data?.progress || 0);
                }
            });
    }

    selectLesson(lesson: any) {
        this.currentLesson.set(lesson);
        // Reset quiz when changing lesson
        this.showQuiz.set(false);
        this.quiz.set([]);
        this.selectedAnswers.set([]);
        this.quizSubmitted.set(false);
    }

    markComplete(lessonId: string) {
        const courseId = this.route.snapshot.paramMap.get('id');
        this.http.post<any>(
            `${this.apiUrl}/progress/complete/${courseId}/${lessonId}`, {}
        ).subscribe({
            next: (res) => {
                this.completedLessons.set(res.data.completedLessons);
                this.progress.set(res.data.progress);
            }
        });
    }

    // Generate AI Quiz
    generateQuiz() {
        const lesson = this.currentLesson();
        if (!lesson) return;

        this.isGeneratingQuiz.set(true);
        this.showQuiz.set(false);
        this.quiz.set([]);
        this.selectedAnswers.set([]);
        this.quizSubmitted.set(false);

        this.http.post<any>(`${this.apiUrl}/ai/quiz`, {
            lessonTitle: lesson.title,
            lessonContent: lesson.content
        }).subscribe({
            next: (res) => {
                this.quiz.set(res.data || []);
                this.selectedAnswers.set(new Array(res.data.length).fill(-1));
                this.showQuiz.set(true);
                this.isGeneratingQuiz.set(false);
            },
            error: () => {
                this.isGeneratingQuiz.set(false);
                alert('Failed to generate quiz!');
            }
        });
    }

    selectAnswer(questionIndex: number, answerIndex: number) {
        if (this.quizSubmitted()) return;
        this.selectedAnswers.update(answers => {
            const newAnswers = [...answers];
            newAnswers[questionIndex] = answerIndex;
            return newAnswers;
        });
    }

    submitQuiz() {
        const answers = this.selectedAnswers();
        const questions = this.quiz();
        let correct = 0;

        questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) correct++;
        });

        this.quizScore.set(Math.round((correct / questions.length) * 100));
        this.quizSubmitted.set(true);
    }

    retakeQuiz() {
        this.selectedAnswers.set(new Array(this.quiz().length).fill(-1));
        this.quizSubmitted.set(false);
        this.quizScore.set(0);
    }

    isCompleted(lessonId: string): boolean {
        return this.completedLessons().includes(lessonId);
    }

    getYoutubeEmbedUrl(url: string): SafeResourceUrl {
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1];
        }
        if (videoId) {
            return this.sanitizer.bypassSecurityTrustResourceUrl(
                `https://www.youtube.com/embed/${videoId}`
            );
        }
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    isYoutubeUrl(url: string): boolean {
        return url?.includes('youtube.com') || url?.includes('youtu.be');
    }

    allAnswered(): boolean {
        return this.selectedAnswers().every(a => a !== -1);
    }
}
