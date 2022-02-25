import { Component, Input, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { AggregationBuilderService } from '../../../../services/aggregation-builder.service';
import { Observable } from 'rxjs';
import { PipelineStage } from './pipeline-stage.enum';
import { addStage } from '../aggregation-builder-forms';
import { debounceTime } from 'rxjs/operators';

/**
 * Aggregation pipeline component.
 */
@Component({
  selector: 'safe-pipeline',
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.scss'],
})
export class SafePipelineComponent implements OnInit {
  public stageType = PipelineStage;
  public stageList: string[] = Object.values(PipelineStage);

  // === DATA ===
  @Input() public fields$!: Observable<any[]>;
  @Input() public metaFields$!: Observable<any[]>;
  public metaFields: any[] = [];
  public initialFields: any[] = [];
  public fieldsPerStage: any[] = [];

  // === PARENT FORM ===
  @Input() pipelineForm!: FormArray;
  constructor(private aggregationBuilder: AggregationBuilderService) {}

  ngOnInit(): void {
    this.fields$.subscribe((fields: any[]) => {
      this.initialFields = [...fields];
      this.fieldsPerStage = [];
      this.updateFieldsPerStage(
        this.pipelineForm.valid ? this.pipelineForm.value : []
      );
    });
    this.metaFields$.subscribe((meta: any) => {
      this.metaFields = Object.assign({}, meta);
    });
    this.pipelineForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe((pipeline: any[]) => {
        if (this.pipelineForm.valid) {
          this.updateFieldsPerStage(pipeline);
        }
      });
  }

  /**
   * Updates fields for the stage.
   *
   * @param pipeline list of pipeline stages.
   */
  private updateFieldsPerStage(pipeline: any[]): void {
    for (let index = 0; index <= pipeline.length; index++) {
      this.fieldsPerStage[index] = this.aggregationBuilder.fieldsAfter(
        this.initialFields,
        pipeline.slice(0, index)
      );
    }
  }

  /**
   * Adds a stage to the aggregation pipeline.
   *
   * @param type type of stage
   */
  public addStage(type: string) {
    this.pipelineForm.push(addStage({ type }));
  }

  /**
   * Deletes a stage at specified index.
   *
   * @param index index of stage to remove in pipeline.
   */
  public deleteStage(index: number) {
    this.pipelineForm.removeAt(index);
  }
}
