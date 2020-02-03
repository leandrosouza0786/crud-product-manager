import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { Department } from "../models/department";
import { tap, delay } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class DepartmentService {
  readonly url = "http://localhost:3000/departments";

  private departmentSubject$: BehaviorSubject<
    Department[]
  > = new BehaviorSubject<Department[]>(null);
  private loaded: Boolean = false;

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<Department[]> {
    if (!this.loaded) {
      this.http
        .get<Department[]>(`${this.url}`)
        .pipe(tap(e => console.log(e)), delay(1000))
        .subscribe(this.departmentSubject$);
      this.loaded = true;
    }
    return this.departmentSubject$.asObservable();
  }

  addDepartment(d: Department): Observable<Department> {
    return this.http
      .post<Department>(`${this.url}`, d)
      .pipe(
        tap((dep: Department) => this.departmentSubject$.getValue().push(dep))
      );
  }

  delDeparment(d: Department): Observable<any> {
    return this.http.delete(`${this.url}/${d._id}`).pipe(
      tap(() => {
        let departments = this.departmentSubject$.getValue();
        let i = departments.findIndex(d => d._id === d._id);
        if (i >= 0) {
          departments.splice(i, 1);
        }
      })
    );
  }

  update(dep: Department): Observable<Department> {
    return this.http.patch<Department>(`${this.url}/${dep._id}`, dep).pipe(
      tap(d => {
        let departments = this.departmentSubject$.getValue();
        let i = departments.findIndex(d => d._id === d._id);
        if (i >= 0) {
          departments[i].name = d.name
        }
      })
    );
  }
}
