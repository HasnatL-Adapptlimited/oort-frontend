import { Component, Inject, OnInit } from '@angular/core';
import { Role, User } from '../../../../models/user.model';
import { PositionAttributeCategory } from '../../../../models/position-attribute-category.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {GetUsersQueryResponse} from '../../../../graphql/queries';
import { GET_USERS } from '../../../../graphql/queries';
import { Apollo } from 'apollo-angular';

interface DialogData {
  roles: Role[];
  users: User[];
  positionAttributeCategories?: PositionAttributeCategory[];
}

@Component({
  selector: 'safe-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class SafeAddUserComponent implements OnInit {

  form: FormGroup = new FormGroup({});
  public filteredUsers?: Observable<User[]>;
  private users: User[] = [];

  get positionAttributes(): FormArray | null {
    return this.form.get('positionAttributes') ? this.form.get('positionAttributes') as FormArray : null;
  }

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<SafeAddUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private apollo: Apollo
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', Validators.minLength(1)],
      role: ['', Validators.required],
      ...this.data.positionAttributeCategories &&
      {
        positionAttributes: this.formBuilder.array(this.data.positionAttributeCategories.map(x => this.formBuilder.group({
            value: [''],
            category: [x.id, Validators.required]
          })))
      }
    });
    this.filteredUsers = this.form.controls.email.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : ''),
      map(x => this.filterUsers(x))
    );

    this.apollo.watchQuery<GetUsersQueryResponse>({
      query: GET_USERS
    }).valueChanges.subscribe(res => {
      const flatInvitedUsers = this.data.users.map(x => x.username);
      this.users = res.data.users.filter(x => !flatInvitedUsers.includes(x.username));
      this.filteredUsers = this.form.controls.email.valueChanges.pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : ''),
        map(x => this.filterUsers(x))
      );
    });
  }

  private filterUsers(value: string): User[] {
    const filterValue = value.toLowerCase();
    return this.users.filter(x => x.username?.toLowerCase().indexOf(filterValue) === 0);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
