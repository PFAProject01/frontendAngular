import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
const BASE_URL = ["http://localhost:8081/"];

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private baseUrl = "http://localhost:8081/api/task";
  
  constructor(private http: HttpClient) {}

  register(signRequest: any): Observable<any> {
    return this.http.post(BASE_URL + "signup", signRequest);
  }

  login(loginRequest: any): Observable<any> {
    return this.http.post(BASE_URL + "login", loginRequest);
  }

  hello(): Observable<any> {
    return this.http.get(BASE_URL + "api/hello", {
      headers: this.createAuhtorizationHeader(),
    });
  }

  getProjectByuser(): Observable<any> {
    const userID = localStorage.getItem("userID");
    return this.http.get(BASE_URL + "api/users1/getProject/" + userID, {
      headers: this.createAuhtorizationHeader(),
    });
  }

  getUserInfo(): Observable<any> {
    const userID = localStorage.getItem("userID");
    return this.http.get(BASE_URL + "api/users1/" + userID, {
      headers: this.createAuhtorizationHeader(),
    });
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

  getProjectById(id: string): Observable<any> {
    return this.http.get<any>(`${BASE_URL + "api/projects"}/${id}`, {
      headers: this.createAuhtorizationHeader(),
    });
  }

  getTaskByIdproject(id: string): Observable<any> {
    return this.http.get<any>(`${BASE_URL + "api/projects/tasks"}/${id}`, {
      headers: this.createAuhtorizationHeader(),
    });
  }
  getNTaskDone(): Observable<any> {
    const userID = localStorage.getItem("userID");
    return this.http.get<any>(`${BASE_URL + "api/task/done-count"}/${userID}`, {
      headers: this.createAuhtorizationHeader(),
    });
  }
  getNTaskInp(): Observable<any> {
    const userID = localStorage.getItem("userID");
    return this.http.get<any>(`${BASE_URL + "api/task/inProgress-count"}/${userID}`, {
      headers: this.createAuhtorizationHeader(),
    });
  }
  getNProjectDone(): Observable<any> {
    const userID = localStorage.getItem("userID");
    return this.http.get<any>(`${BASE_URL + "api/projects/done-count"}/${userID}`, {
      headers: this.createAuhtorizationHeader(),
    });
  }
  getNProjectInp(): Observable<any> {
    const userID = localStorage.getItem("userID");
    return this.http.get<any>(`${BASE_URL + "api/projects/inProgress-count"}/${userID}`, {
      headers: this.createAuhtorizationHeader(),
    });
  }

  createWorkspace(workspaceData: any): Observable<any> {
    return this.http.post(BASE_URL + "api/projects/add", workspaceData, {
      headers: this.createAuhtorizationHeader(),
    });
  }
  updateUserInformation(userId: string, updatedUserInfo: any): Observable<any> {
    return this.http.put(
      BASE_URL + "api/users1/update/" + userId,
      updatedUserInfo,
      {
        headers: this.createAuhtorizationHeader(),
      }
    );
  }
  updatePasswordUser(
    userId: string,
    updatedUserPassword: any
  ): Observable<any> {
    return this.http.put(
      BASE_URL + "api/users1/update-password/" + userId,
      updatedUserPassword,
      {
        headers: this.createAuhtorizationHeader(),
      }
    );
  }

  updateWorkspace(workspaceData: any, id: string): Observable<any> {
    return this.http.put(
      BASE_URL + "api/projects/update/" + id,
      workspaceData,
      {
        headers: this.createAuhtorizationHeader(),
      }
    );
  }

  deleteProject(projectId: string): Observable<any> {
    return this.http.delete(`${BASE_URL}api/projects/delete/${projectId}`, {
      headers: this.createAuhtorizationHeader(),
    });
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${BASE_URL}api/task/delete/${id}`, {
      headers: this.createAuhtorizationHeader(),
    });
  }

  addTask(taskData: any): Observable<any> {
    return this.http.post(BASE_URL + "api/task/add", taskData, {
      headers: this.createAuhtorizationHeader(),
    });
  }
  updateTask(taskData: any,idtask:string): Observable<any> {
    return this.http.put(BASE_URL + "api/task/update/"+idtask, taskData, {
      headers: this.createAuhtorizationHeader(),
    });
  }

  updateStatusTODO(id: string): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/updateStatusTODO/${id}`,
      {},
      { headers: this.createAuhtorizationHeader(), responseType: "text" }
    );
  }

  updateStatusIN_PROGRESS(id: string): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/updateStatusIN_PROGRESS/${id}`,
      {},
      { headers: this.createAuhtorizationHeader(), responseType: "text" }
    );
  }

  updateStatusCOMPLETED(id: string): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/updateStatusCOMPLETED/${id}`,
      {},
      { headers: this.createAuhtorizationHeader(), responseType: "text" }
    );
  }

  updatePriorityLOW(id: string): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/updatePriorityLOW/${id}`,
      {},
      { headers: this.createAuhtorizationHeader(), responseType: "text" }
    );
  }

  updatePriorityMEDIUM(id: string): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/updatePriorityMEDIUM/${id}`,
      {},
      { headers: this.createAuhtorizationHeader(), responseType: "text" }
    );
  }

  updatePriorityHIGH(id: string): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/updatePriorityHIGH/${id}`,
      {},
      { headers: this.createAuhtorizationHeader(), responseType: "text" }
    );
  }
}
