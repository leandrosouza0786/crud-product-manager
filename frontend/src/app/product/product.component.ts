import { Component, OnInit, ViewChild } from "@angular/core";
import { ProductService } from "../services/product.service";
import { FormBuilder, FormGroup, Validators, NgForm } from "@angular/forms";
import { Product } from "../models/product";
import { DepartmentService } from "../services/department.service";
import { Department } from "../models/department";
import { Subject, pipe } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { MatSnackBar } from "@angular/material";

@Component({
  selector: "app-product",
  templateUrl: "./product.component.html",
  styleUrls: ["./product.component.css"]
})
export class ProductComponent implements OnInit {
  productForm: FormGroup = this.fb.group({
    _id: [null],
    name: ["", [Validators.required]],
    stock: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(0)]],
    departments: [[], [Validators.required]]
  });

  @ViewChild('form', null) form : NgForm;

  private unsubscribe$: Subject<any> = new Subject<any>();

  products: Product[] = [];
  departments: Department[] = [];

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    this.productService
      .getProducts()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => (this.products = res));
    this.departmentService
      .getDepartments()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => (this.departments = res));
  }

  save() {
    let data = this.productForm.value;
    if (data._id != null) {
      this.productService.update(data).subscribe(res => {
        console.log("res", res);
      });
    } else {
      this.productService.add(data).subscribe();
      this.resetForm();
    }
  }

  delete(p: Product) {
    this.productService.del(p).subscribe(
      () => this.notify("deletado com sucesso"),
      () => this.notify("erro ao deletar"),
      () => {}
    );
  }

  edit(p: Product) {
    console.log("teste", p);
    this.productForm.setValue(p);
  }

  resetForm() {
    // this.productForm.reset();
    this.form.resetForm();
  }

  notify(msg: string) {
    this.snackbar.open(msg, "ok", { duration: 3000 });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
  }
}
