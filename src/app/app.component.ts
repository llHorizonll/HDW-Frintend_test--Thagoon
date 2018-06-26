import { Component, OnInit } from '@angular/core';
import { Observable, } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';
  prodname: string;
  proddesc: string;

  p: number = 1;
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
      map(actions => actions.map(actions => {
        const data = actions.payload.doc.data();
        const id = actions.payload.doc.id;
        this.total = data.length;
        return { id, ...data };
      }))
    );
  }


  add() {
    this.prodcollection.add({
      name: this.prodname,
      desc: this.proddesc
    }).then((docRef) => {
      this.prodcollection.doc(docRef.id).update({
        date: new Date(),
        imgUrl: `https://fakeimg.pl/350x200/?text=${this.prodname}`
      })
    }).then(() => {
      this.p = 1;
    })
  }

  update(id) {
    this.prodcollection.doc(id).update({
      name: 'newprodname'
    }).then(() => {
      console.log('updated');
    })
  }

  delete(id) {
    this.prodcollection.doc(id).delete().then(() => {
      console.log('deleted');
    })
  }

  // search($event) {
  //   const queryText = $event.target.value;
  //   console.log(queryText);
  // }

  search($event) {
    let q = $event.target.value;
    if (q != '') {
      this.items = this.afs.collection<any>('products', ref => {
        let query: firebase.firestore.Query = ref;
        if (q) { query = query.where('name', '==', q) };
        return query;
      }).valueChanges()
    }
    else {
      this.items = this.getprod();
    }
  }
}
