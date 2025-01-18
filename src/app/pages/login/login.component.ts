import { Component } from "@angular/core";
import { AuthService } from "../services/auth.service"; // Ajustez le chemin si nécessaire
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  email: string = "";
  password: string = "";
  errorMessage: string = ""; // Message d'erreur
  successMessage: string = ""; // Message de succès

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    this.errorMessage = ""; // Réinitialiser les messages
    this.successMessage = "";

    if (this.email && this.password) {
      const loginRequest = {
        email: this.email,
        password: this.password,
      };

      this.authService.login(loginRequest).subscribe(
        (response) => {
          console.log("Login successful", response);
          this.successMessage = "Login successful! Redirecting to dashboard...";
          //alert("Hello, Your token is " + response.jwt);

          // Stocker le token JWT dans localStorage
          localStorage.setItem("jwt", response.jwt);
          localStorage.setItem("userID", response.id);

          // Rediriger après un délai
          setTimeout(() => {
            this.router.navigate(["/dashboard"]);
          }, 2000);
        },
        (error) => {
          console.error("Login failed", error);
          this.errorMessage = "Invalid email or password. Please try again.";
        }
      );
    } else {
      this.errorMessage = "Please enter both email and password.";
    }
  }
}
