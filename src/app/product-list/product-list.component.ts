import { Component, OnInit } from '@angular/core';
import { Observable, } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  prodid: string;
  prodname: string;
  proddesc: string;
  isNewModal = false;
  isDetailModal = false;
  isOkLoading = false;
  p = 1;
  total: number;
  private prodcollection: AngularFirestoreCollection<any>;
  items: Observable<any[]>;

  constructor(private afs: AngularFirestore) {
    this.prodcollection = this.afs.collection<any>('products', ref => ref.orderBy('date', 'desc'));
  }

  ngOnInit() {
    this.items = this.getprod();
  }

  getprod() {
    return this.prodcollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        this.total = data.length;
        return { id, ...data };
      }))
    );
  }

  search($event) {
    const q = $event.target.value;
    if (q !== '') {
      this.items = this.afs.collection<any>('products', ref => {
        let query: firebase.firestore.Query = ref;
        if (q) { query = query.where('name', '==', q); }
        return query;
      }).valueChanges();
    } else {
      this.items = this.getprod();
    }
  }

  showNewModal(): void {
    this.isNewModal = true;
  }
  showDetailModal(product): void {
    this.isDetailModal = true;
    this.prodid = product.id;
    this.prodname = product.name;
    this.proddesc = product.desc;
  }

  handleSave(): void {
    this.isOkLoading = true;
    if (this.prodname) {
      this.prodcollection.add({
        name: this.prodname,
        desc: this.proddesc ? this.proddesc : ' '
      }).then((docRef) => {
        this.prodcollection.doc(docRef.id).update({
          date: new Date(),
          imgUrl: `https://fakeimg.pl/350x200/?text=${this.prodname}`
        });
      }).then(() => {
        this.p = 1;
        this.isNewModal = false;
        this.isOkLoading = false;
      });
    }
  }


  handleUpdate() {
    this.isOkLoading = true;
    this.prodcollection.doc(this.prodid).update({
      name: this.prodname,
      desc: this.proddesc
    }).then(() => {
      this.isDetailModal = false;
      this.isOkLoading = false;
    }).catch((error) => {
      console.log(error);
    });
  }

  handleDelete() {
    this.isOkLoading = true;
    this.prodcollection.doc(this.prodid).delete()
    .then(() => {
      this.isDetailModal = false;
      this.isOkLoading = false;
    })
    .catch((error) => {
      console.log(error);
    });
  }


  handleCancel(): void {
    this.isNewModal = false;
    this.isDetailModal = false;
  }

}
