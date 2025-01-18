import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { AuthService } from "../services/auth.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.scss"],
})
export class UserProfileComponent implements OnInit {
  userForm: FormGroup;
  userIn: any;
  passwordForm!: FormGroup;
  successMessage: string = ""; // Message de succès
  errorMessage: string = ""; // Message d'erreur
  successMessage1: string = ""; // Message de succès
  errorMessage1: string = ""; // Message d'erreur
  isPhotoModalOpen = false;
  

  photoForm: FormGroup;
  selectedFile: File;

  constructor(
    private fb: FormBuilder,
    private AuthService: AuthService,
    private http: HttpClient
  ) {
    this.userForm = this.fb.group({
      firstname: [""],
      lastname: [""],
      email: [""],
      phoneNumber: [""],
    });
  }
  ngOnInit(): void {
    this.AuthService.getUserInfo().subscribe((data) => {
      this.userForm.patchValue({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phoneNumber: data.phoneNumber,
        image: data.image,
      });
    });
    this.UserId();
    this.passwordForm = this.fb.group(
      {
        oldPassword: ["", Validators.required],
        newPassword: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
    // Initialize photoForm
  this.photoForm = this.fb.group({
    image: [null, Validators.required],
  });
  }
  // Validator to check if passwords match
  passwordMatchValidator(
    form: AbstractControl
  ): { [key: string]: boolean } | null {
    const newPassword = form.get("newPassword")?.value;
    const confirmPassword = form.get("confirmPassword")?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onChangePassword(): void {
    const userId = localStorage.getItem("userID");
    if (this.passwordForm.valid) {
      const { oldPassword, newPassword } = this.passwordForm.value;
      const updatePasswordPayload = { oldPassword, newPassword };

      this.AuthService.updatePasswordUser(
        userId,
        updatePasswordPayload
      ).subscribe({
        next: (response) => {
          alert("Mot de passe mis à jour avec succès.");
          this.successMessage1 = "Password updated succesfully";
          this.errorMessage1 = ""; // Efface les anciens messages d'erreur
        },
        error: (error) => {
          console.error(
            "Erreur lors de la mise à jour du mot de passe:",
            error
          );
          this.errorMessage1 = "An error occurred while updating the password.";
          this.successMessage1 = ""; // Efface les anciens messages de succès
        },
        complete: () => {
          console.log("Mise à jour du mot de passe terminée.");
        },
      });
    } else {
      alert("Veuillez remplir tous les champs correctement.");
    }
  }

  onSubmit(): void {
    const userId = localStorage.getItem("userID");

    if (this.userForm.valid) {
      const updatedUserInfo = {
        ...this.userForm.value,
        id: userId,
      };

      this.AuthService.updateUserInformation(userId, updatedUserInfo).subscribe(
        {
          next: (response) => {
            console.log("Update successful:", response);
            this.successMessage =
              "Your information has been updated successfully.";
            this.errorMessage = ""; // Efface les anciens messages d'erreur
            this.refreshUserInfo();
          },
          error: (error) => {
            console.error("Erreur lors de la mise à jour :", error);
            this.errorMessage = "An error occurred during the update.";
            this.successMessage = ""; // Efface les anciens messages de succès
          },
        }
      );
    } else {
      this.errorMessage = "Please fill in all fields correctly.";
      this.successMessage = "";
    }
  }

  UserId() {
    this.AuthService.getUserInfo().subscribe({
      next: (response) => {
        this.userIn = response;
        console.log("user loaded:", this.userIn);
      },
      error: (err) => {
        console.error("Error loading user:", err);
      },
    });
  }
  openPhotoModal() {
    this.isPhotoModalOpen = true;
  }
  closePhotoModal() {
    this.isPhotoModalOpen = false;
    this.photoForm.reset();
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  private createAuhtorizationHeader() {
    const jwtToken = localStorage.getItem("jwt");
    if (jwtToken) {
      console.log("JWT token found in local storage", jwtToken);
      return new HttpHeaders().set("Authorization", "Bearer " + jwtToken);
    } else {
      console.log("JWT token not found in local storage");
    }
    return null;
  }
  refreshUserInfo() {
    this.AuthService.getUserInfo().subscribe({
      next: (data) => {
        this.userIn = data;
        this.userForm.patchValue({
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          phoneNumber: data.phoneNumber,
          image: data.image,
        });
      },
      error: (err) => {
        console.error("Error while reloading user information:", err);
      },
    });
  }

  updatePhoto(event: Event) {
    event.preventDefault();

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append("image", this.selectedFile);

      // Requête HTTP avec en-têtes d'autorisation
      this.http
        .post(
          "http://localhost:8081/api/users1/image/" + this.userIn.id,
          formData,
          { headers: this.createAuhtorizationHeader() }
        )
        .subscribe({
          next: (response: any) => {
            this.refreshUserInfo();
            this.closePhotoModal();
          },
          error: (err) => {
            console.error("Error while uploading", err);
          },
        });
    }
  }
}
