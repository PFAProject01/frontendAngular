import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { NgbModal, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { title } from "process";

@Component({
  selector: "app-project-details",
  templateUrl: "./project-details.component.html",
  styleUrls: ["./project-details.component.scss"],
  providers: [NgbModalConfig, NgbModal],
})
export class ProjectDetailsComponent implements OnInit {
  project: any = {}; // Projet actuel
  tasks: any[] = []; // Liste des tâches
  idd!: string; // ID du projet actuel
  workspaceForm!: FormGroup; // Formulaire pour le workspace
  taskForm: FormGroup;
  taskFormUp: FormGroup;
  loading: boolean = false; // Indicateur de chargement
  errorMessage: string = ""; // Message d'erreur
  successMessage: string = ""; // Message de succès
  errorMessage1: string = ""; // Message d'erreur
  successMessage1: string = ""; // Message de succès
  currentTaskId :string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Récupération de l'ID du projet depuis l'URL
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.idd = id;
      this.loadProjectDetails(id);
      this.loadTasks(id);
    }

    // Initialisation du formulaire
    this.workspaceForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(3)]],
      description: ["", Validators.required],
      status: ["", Validators.required],
    });
    this.taskForm = this.fb.group({
      title: ["", Validators.required], // Champ obligatoire
      priority: ["", Validators.required],
      description: ["", Validators.required],
      dueDate: ["", Validators.required],
    });
    this.taskFormUp = this.fb.group({
      title1: ["", Validators.required], // Champ obligatoire
      description1: ["", Validators.required],
      dueDate1: ["", Validators.required],
    });
  }

  // Charger les détails du projet
  loadProjectDetails(id: string): void {
    this.loading = true;
    this.authService.getProjectById(id).subscribe({
      next: (data) => {
        this.project = data;
        // Pré-remplir le formulaire avec les données du projet
        this.workspaceForm.patchValue({
          name: data.name,
          description: data.description,
          status: data.status,
        });
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = "Erreur lors du chargement du projet.";
        console.error(err);
        this.loading = false;
      },
    });
  }

  // Charger les tâches liées au projet
  loadTasks(id: string): void {
    this.authService.getTaskByIdproject(id).subscribe({
      next: (response) => {
        this.tasks = response;
        console.log("Tâches chargées :", this.tasks);
      },
      error: (err) => {
        this.errorMessage = "Erreur lors du chargement des tâches.";
        console.error(err);
      },
    });
  }

  // Mettre à jour le workspace
  updateWorkspace(): void {
    if (this.workspaceForm.invalid) {
      console.error("The form is invalid.");
      return;
    }

    const ownerID = localStorage.getItem("userID"); // Récupération de l'ID utilisateur
    if (!ownerID) {
      console.error("User ID not found in local storage");
      return;
    }

    const workspaceData = {
      ...this.workspaceForm.value,
      owner: ownerID, // Ajout de l'ID du propriétaire
    };

    this.loading = true; // Activer l'indicateur de chargement
    this.authService.updateWorkspace(workspaceData, this.idd).subscribe({
      next: (response) => {
        console.log("Workspace updated successfully:", response);
        this.successMessage1 = "Workspace updated successfully!"; // Afficher le message de succès
        this.errorMessage1 = ""; // Réinitialiser l'erreur
        // Recharger la page ou rediriger
        setTimeout(() => {
          window.location.reload();
        }, 1500); // Attendre un peu avant de recharger la page
      },
      error: (error) => {
        this.errorMessage1 = "Error while updating the workspace."; // Afficher le message d'erreur
        this.successMessage1 = ""; // Réinitialiser le succès
        console.error(error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  confirmDelete(): void {
    this.authService.deleteProject(this.idd).subscribe({
      next: () => {
        console.log("Project successfully deleted");
        this.successMessage = "Project successfully deleted!"; // Message de succès
        this.errorMessage = ""; // Réinitialiser l'erreur
        // Redirigez ou mettez à jour la liste après la suppression
        this.router.navigate(["/dashboard"]).then(() => {
          window.location.reload();
        });
      },
      error: (err) => {
        this.errorMessage = "Error when deleting the project.";
        console.error("Error when deleting project:", err);
      },
    });
  }

  confirmDeleteTask(id): void {
    this.authService.deleteTask(id).subscribe({
      next: () => {
        console.log("Task successfully deleted");
        this.successMessage = "Task successfully removed!"; // Message de succès
        this.errorMessage = ""; // Réinitialiser l'erreur
        window.location.reload();
      },
      error: (err) => {
        this.errorMessage = "Error when deleting the task.";
        console.error("Error while deleting the task:", err);
      },
    });
  }

  addTask(): void {
    if (this.taskForm.valid) {
      const ownerID = localStorage.getItem("userID");
      const taskData = {
        ...this.taskForm.value,
        assignedToId: ownerID, // Ajout de l'ID du propriétaire
        projectId: this.idd,
      };

      this.authService.addTask(taskData).subscribe({
        next: () => {
          this.successMessage = "Task added successfully!"; // Message de succès
          this.errorMessage = ""; // Réinitialiser l'erreur
          // Recharger les tâches et fermer le modal
          this.loadTasks(this.idd);
          this.taskForm.reset(); // Réinitialiser le formulaire
          this.modalService.dismissAll(); // Fermer le modal
        },
        error: (err) => {
          this.errorMessage = "Error while adding the task."; // Message d'erreur
          this.successMessage = ""; // Réinitialiser le succès
          console.error("Error when adding the task:", err);
        },
      });
    } else {
      this.errorMessage = "Please fill in all required fields.";
      this.successMessage = "";
    }
  }
  updateTask(): void {
    if (this.taskFormUp.valid) {
      const taskData = {
        title :this.taskFormUp.value.title1,
        description:this.taskFormUp.value.description1,
        dueDate:this.taskFormUp.value.dueDate1,
      };
      this.authService.updateTask(taskData,this.currentTaskId).subscribe({
        next: () => {
          this.successMessage = "Task updated successfully!"; // Message de succès
          this.errorMessage = ""; // Réinitialiser l'erreur
          // Recharger les tâches et fermer le modal
          this.loadTasks(this.idd);
          this.taskForm.reset(); // Réinitialiser le formulaire
          this.modalService.dismissAll(); // Fermer le modal
        },
        error: (err) => {
          this.errorMessage = "Error while updating the task."; // Message d'erreur
          this.successMessage = ""; // Réinitialiser le succès
          console.error("Error when updating the task:", err);
        },
      });
    } else {
      this.errorMessage = "Please fill in all required fields.";
      this.successMessage = "";
    }
  }

  // Méthodes pour mettre à jour le statut
  setStatusTODO(id: string): void {
    this.authService
      .updateStatusTODO(id)
      .subscribe(() => this.loadTasks(this.idd));
  }

  setStatusIN_PROGRESS(id: string): void {
    this.authService
      .updateStatusIN_PROGRESS(id)
      .subscribe(() => this.loadTasks(this.idd));
  }

  setStatusCOMPLETED(id: string): void {
    this.authService
      .updateStatusCOMPLETED(id)
      .subscribe(() => this.loadTasks(this.idd));
  }

  // Méthodes pour mettre à jour la priorité
  setPriorityLOW(id: string): void {
    this.authService
      .updatePriorityLOW(id)
      .subscribe(() => this.loadTasks(this.idd));
  }

  setPriorityMEDIUM(id: string): void {
    this.authService.updatePriorityMEDIUM(id).subscribe({
      next: () => this.loadTasks(this.idd),
      error: (error) =>
        console.error("Erreur sur updateStatusCOMPLETED :", error),
    });
  }

  setPriorityHIGH(id: string): void {
    this.authService
      .updatePriorityHIGH(id)
      .subscribe(() => this.loadTasks(this.idd));
  }
  openUpdateModal(task: any) {
    // Pré-remplir les valeurs existantes dans le formulaire
    this.taskFormUp.patchValue({
      title1: task.title,
      description1: task.description,
      dueDate1: task.dueDate,
    });
    // Garder une référence de la tâche pour l'update
    this.currentTaskId = task.id;

}
}
