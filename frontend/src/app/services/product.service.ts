import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, combineLatest } from "rxjs";
import { Product } from "../models/product";
import { DepartmentService } from "./department.service";
import { map, tap, filter } from "rxjs/operators";
import { Department } from "../models/department";

@Injectable({
  providedIn: "root"
})
export class ProductService {
  readonly url = "http://localhost:3000/products";

  private productsSubject$: BehaviorSubject<Product[]> = new BehaviorSubject<
    Product[]
  >(null);
  private loadead: boolean = false;

  constructor(
    private http: HttpClient,
    private deparmentService: DepartmentService
  ) {
    this.getProducts().subscribe(prod => console.log("construsctor", prod));
  }

  getProducts(): Observable<Product[]> {
    if (!this.loadead) {
      combineLatest(
        this.http.get<Product[]>(`${this.url}`),
        this.deparmentService.getDepartments()
      )
        .pipe(
          filter(([prod, department]) => prod != null && department != null),
          map(([prod, department]) => {
            for (let p of prod) {
              let ids = p.departments as string[];
              p.departments = ids.map(id =>
                department.find(dep => dep._id == id)
              );
            }
            return prod;
          }),
          tap(products => console.log(products))
        )
        .subscribe(this.productsSubject$);
      this.loadead = true;
    }
    return this.productsSubject$.asObservable();
  }

  add(prod: Product): Observable<Product> {
    let departments = (prod.departments as Department[]).map(d => d._id);
    return this.http
      .post<Product>(`${this.url}`, { ...prod, departments })
      .pipe(
        tap(prod => {
          this.productsSubject$.getValue().push({ ...prod, _id: prod._id });
        })
      );
  }

  del(prod: Product): Observable<any> {
    return this.http.delete(`${this.url}/${prod._id}`).pipe(
      tap(() => {
        let products = this.productsSubject$.getValue();
        let i = products.findIndex(p => p._id === prod._id);
        if (i >= 0) {
          products.splice(i, i);
        }
      })
    );
  }

  update(prod: Product): Observable<Product>{
    let departments = (prod.departments as Department[]).map(d => d._id);
    return this.http.patch<Product>(`${this.url}/${prod._id}`,{...prod, departments})
    .pipe(
      tap(() => {
        let products = this.productsSubject$.getValue();
        let i = products.findIndex(p => p._id === prod._id);
        if (i >= 0) {
          products[i] = prod;
        }
      })
    );
  };
}
