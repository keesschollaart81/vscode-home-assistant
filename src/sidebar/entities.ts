/* eslint-disable no-underscore-dangle */
/* eslint-disable max-classes-per-file */
import * as vscode from "vscode";
import { HassEntity } from "home-assistant-js-websocket";
import { extensionId } from "../constants";

export class EntitiesProvider implements vscode.TreeDataProvider<Entity> {
  private _onDidChangeTreeData: vscode.EventEmitter<Entity | undefined | void> =
    new vscode.EventEmitter<Entity | undefined | void>();

  readonly onDidChangeTreeData: vscode.Event<Entity | undefined | void> =
    this._onDidChangeTreeData.event;

  public entities!: HassEntity[];

  public view: vscode.TreeView<Entity>;

  constructor(context: vscode.ExtensionContext) {
    this.view = vscode.window.createTreeView(`${extensionId}.entities`, {
      treeDataProvider: this,
      showCollapseAll: true,
      canSelectMany: true,
    });
    context.subscriptions.push(this.view);
  }

  refresh(): void {
    void vscode.commands.executeCommand(`${extensionId}.fetchEntities`);
  }

  public updateEntities(entities: HassEntity[]): void {
    this.entities = entities;
    this.view.title = `Entities (${entities.length})`;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Entity): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Entity): Thenable<Entity[]> {
    if (this.entities) {
      return Promise.resolve(this.getEntityTreeItems(this.entities));
    }

    void vscode.window.showInformationMessage("No entities found");
    return Promise.resolve([]);
  }

  private getEntityTreeItems(entities: HassEntity[]) {
    if (entities) {
      return entities.map(
        (entity) =>
          new Entity(
            entity.entity_id,
            entity.attributes.friendly_name,
            entity.state,
            vscode.TreeItemCollapsibleState.None
          )
      );
    }
    return [];
  }
}

export class Entity extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private readonly friendlyName: string,
    private readonly state: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    this.state = state;
    this.tooltip = this.state;
    this.description = this.friendlyName;
  }

  contextValue = "entity";
}

export class Domain extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private readonly count: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.description = this.count;
  }

  contextValue = "domain";
}
