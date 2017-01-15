import { Input, Component, OnInit, ElementRef, Inject } from '@angular/core';
import { TreeViewOptions, Tree } from './tree.types';
import { NodeMenuService } from './menu/node-menu.service';
import { NodeMenuItemSelectedEvent, NodeMenuItemAction } from './menu/menu.types';
import { NodeEditableEvent, NodeEditableEventAction } from './editable/editable.types';
import { TreeService } from './tree.service';
import * as EventUtils from './utils/event.utils';

@Component({
  selector: 'tree-internal',
  template: `
  <ul class="tree" *ngIf="tree" [ngClass]="{rootless: !viewOptions.rootIsVisible}">
    <li>
      <div [ngClass]="{rootless: !viewOptions.rootIsVisible}" (contextmenu)="showMenu($event)" [nodeDraggable]="element" [tree]="tree">
        <div class="folding" (click)="tree.switchFoldingType()" [ngClass]="tree.getFoldingTypeCssClass()"></div>
        <div href="#" class="node-value" *ngIf="!tree.isEditInProgressOrNew()" [class.node-selected]="isSelected" (click)="onNodeSelected($event)">{{tree.value}}</div>

        <input type="text" class="node-value" *ngIf="tree.isEditInProgressOrNew()"
               [nodeEditable]="tree.value"
               (valueChanged)="applyNewValue($event)"/>
      </div>

      <node-menu *ngIf="isMenuVisible" (menuItemSelected)="onMenuItemSelected($event)"></node-menu>

      <template [ngIf]="tree.isNodeExpanded()">
        <tree-internal *ngFor="let child of tree.children" [tree]="child"></tree-internal>
      </template>
    </li>
  </ul>
  `
})
export class TreeInternalComponent implements OnInit {
  @Input()
  public tree: Tree;

  @Input()
  public viewOptions: TreeViewOptions;

  public isSelected: boolean = false;
  private isMenuVisible: boolean = false;

  public constructor(@Inject(NodeMenuService) private nodeMenuService: NodeMenuService,
                     @Inject(TreeService) private treeService: TreeService,
                     @Inject(ElementRef) public element: ElementRef) {
  }

  public ngOnInit(): void {
    this.viewOptions = this.viewOptions || new TreeViewOptions();

    this.treeService.unselectEventStream(this.tree).subscribe(() => this.isSelected = false);
    this.nodeMenuService.hideMenuEventStream(this.element).subscribe(() => this.isMenuVisible = false);
    this.treeService.addDragNDropBehaviourTo({tree: this.tree, treeElementRef: this.element});
  }

  public onNodeSelected(e: MouseEvent): void {
    if (EventUtils.isLeftButtonClicked(e)) {
      this.isSelected = true;
      this.treeService.fireNodeSelected(this.tree);
    }
  }

  public showMenu(e: MouseEvent): void {
    if (this.tree.isStatic()) {
      return;
    }

    if (EventUtils.isRightButtonClicked(e)) {
      this.isMenuVisible = !this.isMenuVisible;
      this.nodeMenuService.hideMenuForAllNodesExcept(this.element);
    }
    e.preventDefault();
  }

  public onMenuItemSelected(e: NodeMenuItemSelectedEvent): void {
    switch (e.nodeMenuItemAction) {
      case NodeMenuItemAction.NewTag:
        this.onNewSelected(e);
        break;
      case NodeMenuItemAction.NewFolder:
        this.onNewSelected(e);
        break;
      case NodeMenuItemAction.Rename:
        this.onRenameSelected();
        break;
      case NodeMenuItemAction.Remove:
        this.onRemoveSelected();
        break;
      default:
        throw new Error(`Chosen menu item doesn't exist`);
    }
  }

  private onNewSelected(e: NodeMenuItemSelectedEvent): void {
    this.tree.createNode(e.nodeMenuItemAction === NodeMenuItemAction.NewFolder);
    this.isMenuVisible = false;
  }

  private onRenameSelected(): void {
    this.tree.markAsEditInProgress();
    this.isMenuVisible = false;
  }

  private onRemoveSelected(): void {
    this.treeService.fireNodeRemoved(this.tree);
  }

  public applyNewValue(e: NodeEditableEvent): void {
    if (e.action === NodeEditableEventAction.Cancel && Tree.isValueEmpty(e.value)) {
      return this.treeService.fireNodeRemoved(this.tree);
    }

    if (this.tree.isNew() && Tree.isValueEmpty(e.value)) {
      return this.treeService.fireNodeRemoved(this.tree);
    }

    if (this.tree.isNew()) {
      this.tree.value = e.value;
      this.treeService.fireNodeCreated(this.tree);
    }

    if (this.tree.isEditInProgress()) {
      const oldValue = this.tree.value;
      this.tree.value = e.value;
      this.treeService.fireNodeRenamed(oldValue, this.tree);
    }

    this.tree.markAsModified();
  }
}