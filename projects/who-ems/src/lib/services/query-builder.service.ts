import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { GetQueryTypes, GET_QUERY_TYPES } from '../graphql/queries';
import gql from 'graphql-tag';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

const DEFAULT_FIELDS = ['id', 'createdAt', 'createdBy', 'canEdit'];

const DISABLED_FIELDS = ['createdBy'];

@Injectable({
  providedIn: 'root'
})
export class QueryBuilderService {

  // tslint:disable-next-line: variable-name
  public __availableQueries = new BehaviorSubject<any[]>([]);

  get availableQueries(): Observable<any> {
    return this.__availableQueries.asObservable();
  }

  constructor(
    private apollo: Apollo,
    private formBuilder: FormBuilder
  ) {
    this.apollo.watchQuery<GetQueryTypes>({
      query: GET_QUERY_TYPES,
    }).valueChanges.subscribe((res) => {
      this.__availableQueries.next(res.data.__schema.queryType.fields.filter(x => x.name.startsWith('all')));
    });
  }

  public getFields(queryName: string): any[] {
    const query = this.__availableQueries.getValue().find(x => x.name === queryName);
    return query ? query.type.ofType.fields.filter(x => !DISABLED_FIELDS.includes(x.name)) : [];
  }

  public getFieldsFromType(typeName: string): any[] {
    const query = this.__availableQueries.getValue().find(x => x.type.ofType.name === typeName);
    return query ? query.type.ofType.fields.filter(x => !DISABLED_FIELDS.includes(x.name)) : [];
  }

  public getListFields(queryName: string): any[] {
    const query = this.__availableQueries.getValue().find(x => x.name === queryName);
    return query ? query.type.ofType.fields.filter(x => x.type.kind === 'LIST') : [];
  }

  public getFilter(queryName: string): any[] {
    const query = this.__availableQueries.getValue().find(x => x.name === queryName);
    return query ? query.args.find(x => x.name === 'filter').type.inputFields : [];
  }

  public getFilterFromType(typeName: string): any[] {
    const query = this.__availableQueries.getValue().find(x => x.type.ofType.name === typeName);
    return query ? query.args.find(x => x.name === 'filter').type.inputFields : [];
  }

  private buildFilter(filter: any): any {
    return filter ? Object.keys(filter).reduce((o, key) => {
      if (filter[key] || filter[key] === false) {
        return { ...o, [key]: filter[key] };
      }
      return { ...o };
    }, {}) : null;
  }

  private buildFields(fields: any[]): any {
    return ['id\n'].concat(fields.map(x => {
      switch (x.kind) {
        case 'SCALAR': {
          return x.name + '\n';
        }
        case 'LIST': {
          return `${x.name}(
            sortField: ${x.sort.field ? `"${x.sort.field}"` : null},
            sortOrder: "${x.sort.order}",
            filter: ${this.objToString(this.buildFilter(x.filter))}
          ) {
            ${this.buildFields(x.fields)}
          }` + '\n';
        }
        case 'OBJECT': {
          return `${x.name} {
            ${this.buildFields(x.fields)}
          }` + '\n';
        }
        default: {
          return;
        }
      }
    }));
  }

  private buildMetaFields(fields: any[]): any {
    return [''].concat(fields.filter(x => !DEFAULT_FIELDS.includes(x.name)).map(x => {
      switch (x.kind) {
        case 'SCALAR': {
          return x.name + '\n';
        }
        case 'LIST': {
          return `${x.name}() {
            ${this.buildMetaFields(x.fields)}
          }` + '\n';
        }
        case 'OBJECT': {
          return `${x.name} {
            ${this.buildMetaFields(x.fields)}
          }` + '\n';
        }
        default: {
          return;
        }
      }
    }));
  }

  public buildQuery(settings: any): any {
    const builtQuery = settings.query;
    if (builtQuery && builtQuery.fields.length > 0) {
      const fields = this.buildFields(builtQuery.fields);
      const metaFields = this.buildMetaFields(builtQuery.fields);
      const query = gql`
        query GetCustomQuery {
          ${builtQuery.name}(
            sortField: ${builtQuery.sort.field ? `"${builtQuery.sort.field}"` : null},
            sortOrder: "${builtQuery.sort.order}",
            filter: ${this.objToString(this.buildFilter(builtQuery.filter))}
          ) {
            ${fields}
          }
        }
      `;
      return this.apollo.watchQuery<any>({
        query,
        variables: {}
      });
    } else {
      return null;
    }
  }

  public buildMetaQuery(settings: any): any {
    const builtQuery = settings.query;
    if (builtQuery && builtQuery.fields.length > 0) {
      const metaFields = this.buildMetaFields(builtQuery.fields);
      const query = gql`
        query GetCustomMetaQuery {
          _${builtQuery.name}Meta {
            ${metaFields}
          }
        }
      `;
      return this.apollo.query<any>({
        query,
        variables: {}
      });
    } else {
      return null;
    }
  }

  private objToString(obj): string {
    let str = '{';
    for (const p in obj) {
      if (obj.hasOwnProperty(p)) {
        str += p + ': ' + (typeof obj[p] === 'string' ? `"${obj[p]}"` : obj[p]) + ',\n';
      }
    }
    return str + '}';
  }

  public createQueryForm(value: any): FormGroup {
    return this.formBuilder.group({
      name: [value ? value.name : '', Validators.required],
      fields: this.formBuilder.array((value && value.fields) ? value.fields.map(x => this.addNewField(x)) : [], Validators.required),
      sort: this.formBuilder.group({
        field: [(value && value.sort) ? value.sort.field : ''],
        order: [(value && value.sort) ? value.sort.order : 'asc']
      }),
      filter: this.createFilterGroup(value ? value.filter : {} , null)
    });
  }

  public createFilterGroup(filter: any, availableFilter: any): FormGroup {
    if (availableFilter) {
      const group = availableFilter.reduce((o, key) => {
        return ({ ...o, [key.name]: [(filter && (filter[key.name] || filter[key.name] === false) ? filter[key.name] : null)] });
      }, {});
      return this.formBuilder.group(group);
    } else {
      const group = Object.keys(filter).reduce((o, key) => {
        return ({ ...o, [key]: [(filter && (filter[key] || filter[key] === false) ? filter[key] : null)] });
      }, {});
      return this.formBuilder.group(group);
    }
  }

  public addNewField(field: any, newField?: boolean): FormGroup {
    switch (newField ? field.type.kind : field.kind) {
      case 'LIST': {
        return this.formBuilder.group({
          name: [{ value: field.name, disabled: true }],
          type: [newField ? field.type.ofType.name : field.type],
          kind: [newField ? field.type.kind : field.kind],
          fields: this.formBuilder.array((!newField && field.fields) ?
            field.fields.map(x => this.addNewField(x)) : [], Validators.required),
          sort: this.formBuilder.group({
            field: [field.sort ? field.sort.field : ''],
            order: [(field.sort && field.sort.order) ? field.sort.order : 'asc']
          }),
          filter: newField ? this.formBuilder.group({}) : this.createFilterGroup(field.filter, null)
        });
      }
      case 'OBJECT': {
        return this.formBuilder.group({
          name: [{ value: field.name, disabled: true }],
          type: [newField ? field.type.name : field.type],
          kind: [newField ? field.type.kind : field.kind],
          fields: this.formBuilder.array((!newField && field.fields) ?
            field.fields.map(x => this.addNewField(x)) : [], Validators.required),
        });
      }
      default: {
        return this.formBuilder.group({
          name: [{ value: field.name, disabled: true }],
          type: [{ value: newField ? field.type.name : field.type, disabled: true }],
          kind: [newField ? field.type.kind : field.kind],
          label: [field.label ? field.label : field.name, Validators.required]
        });
      }
    }
  }
}
