import { Component, OnInit } from "@angular/core";
import { Department } from "../models/department";
import { DepartmentService } from "../services/department.service";
import { MatSnackBar } from "@angular/material";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-department",
  templateUrl: "./department.component.html",
  styleUrls: ["./department.component.css"]
})
export class DepartmentComponent implements OnInit {
  depName: string = "";
  departments: Department[] = [];
  depEdit: Department = null;

  private unsubscribe: Subject<any> = new Subject();

  constructor(
    private departmentService: DepartmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.departmentService
      .getDepartments()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(deps => (this.departments = deps));
  }

  save() {
    if (this.depEdit) {
      this.departmentService
        .update({
          name: this.depName,
          _id: this.depEdit._id
        })
        .subscribe(
          dep => {
            this.notify("Com sucesso");
          },
          error => {
            this.notify("error ao salvar");
            console.log(error);
          }
        );
    } else {
      this.departmentService.addDepartment({ name: this.depName }).subscribe(
        res => {
          console.log(res);
          this.clearFields();
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  clearFields() {
    this.depName = "";
    this.depEdit = null;
  }

  cancel() {
    this.clearFields();
  }

  edit(edp: Department) {
    this.depName = edp.name;
    this.depEdit = edp;
  }

  delete(dep: Department) {
    this.departmentService.delDeparment(dep).subscribe(
      res => {
        this.notify("deletado com sucesso");
      },
      error => {
        this.notify("Erro ao deletar");
      }
    );
  }

  notify(msg: string) {
    this.snackBar.open(msg, "ok", { duration: 3000 });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
  }
}
