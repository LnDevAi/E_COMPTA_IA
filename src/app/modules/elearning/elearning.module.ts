import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Services
import { ELearningService } from './services/elearning.service';

// Components
import { LearningPlatformComponent } from './components/learning-platform/learning-platform.component';
import { CourseViewerComponent } from './components/course-viewer/course-viewer.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { ExerciseComponent } from './components/exercise/exercise.component';
import { CertificateViewerComponent } from './components/certificate-viewer/certificate-viewer.component';
import { ProgressTrackerComponent } from './components/progress-tracker/progress-tracker.component';
import { RecommendationsComponent } from './components/recommendations/recommendations.component';

// Shared Components (à créer si nécessaire)
// import { VideoPlayerComponent } from './components/shared/video-player/video-player.component';
// import { SimulationComponent } from './components/shared/simulation/simulation.component';

const routes: Routes = [
  {
    path: '',
    component: LearningPlatformComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: LearningPlatformComponent },
      { path: 'catalogue', component: LearningPlatformComponent },
      { path: 'mes-cours', component: LearningPlatformComponent },
      { path: 'certificats', component: LearningPlatformComponent },
      { path: 'statistiques', component: LearningPlatformComponent }
    ]
  },
  {
    path: 'cours/:id',
    component: CourseViewerComponent
  },
  {
    path: 'quiz/:id',
    component: QuizComponent
  },
  {
    path: 'exercice/:id',
    component: ExerciseComponent
  },
  {
    path: 'certificat/:id',
    component: CertificateViewerComponent
  },
  {
    path: 'recommandations',
    component: RecommendationsComponent
  }
];

@NgModule({
  declarations: [
    LearningPlatformComponent,
    CourseViewerComponent,
    QuizComponent,
    ExerciseComponent,
    CertificateViewerComponent,
    ProgressTrackerComponent,
    RecommendationsComponent
    // VideoPlayerComponent,
    // SimulationComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    ELearningService
  ],
  exports: [
    LearningPlatformComponent,
    ProgressTrackerComponent // Pour utilisation dans d'autres modules
  ]
})
export class ElearningModule { }