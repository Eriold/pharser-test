import Phaser from "phaser";
import type { NpcRouteFlowDefinition, RouteArrangeStage, RouteChoiceStage, RouteStage } from "./NpcRouteTypes";

type RouteFlowLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export class NpcRouteFlow {
  private readonly scene: Phaser.Scene;
  private readonly definition: NpcRouteFlowDefinition;
  private readonly layout: RouteFlowLayout;
  private readonly onResolve: (success: boolean) => void;
  private readonly objects: Array<Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text> = [];
  private readonly uiDepth = 1001;
  private stageIndex = 0;
  private selectedTokenIds: string[] = [];
  private selectedChoiceId: string | null = null;
  private hidden = false;
  private panelBg!: Phaser.GameObjects.Rectangle;
  private titleText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private helperText!: Phaser.GameObjects.Text;
  private phraseBox!: Phaser.GameObjects.Rectangle;
  private phraseText!: Phaser.GameObjects.Text;
  private actionButtonBg!: Phaser.GameObjects.Rectangle;
  private actionButtonText!: Phaser.GameObjects.Text;
  private resetButtonBg!: Phaser.GameObjects.Rectangle;
  private resetButtonText!: Phaser.GameObjects.Text;
  private stageObjects: Array<Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text> = [];

  constructor(scene: Phaser.Scene, definition: NpcRouteFlowDefinition, layout: RouteFlowLayout, onResolve: (success: boolean) => void) {
    this.scene = scene;
    this.definition = definition;
    this.layout = layout;
    this.onResolve = onResolve;
    this.buildShell();
    this.renderStage();
    this.setVisible(false);
  }

  setVisible(visible: boolean) {
    this.hidden = !visible;
    for (const object of this.objects) {
      object.visible = visible;
    }
    for (const object of this.stageObjects) {
      object.visible = visible;
    }
  }

  destroy() {
    for (const object of [...this.objects, ...this.stageObjects]) {
      object.destroy();
    }
    this.objects.length = 0;
    this.stageObjects.length = 0;
  }

  private buildShell() {
    const palette = this.currentStage().palette;
    this.panelBg = this.decorateUiObject(this.scene.add.rectangle(this.layout.x, this.layout.y, this.layout.width, this.layout.height, this.hex(palette.panel), 0.94).setOrigin(0));
    this.titleText = this.decorateUiObject(this.scene.add.text(this.layout.x + 12, this.layout.y + 8, "Route challenge", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: palette.prompt
    }));
    this.promptText = this.decorateUiObject(this.scene.add.text(this.layout.x + 12, this.layout.y + 32, "", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: palette.prompt,
      wordWrap: { width: this.layout.width - 24 }
    }));
    this.helperText = this.decorateUiObject(this.scene.add.text(this.layout.x + 12, this.layout.y + 56, "", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: palette.helper,
      wordWrap: { width: this.layout.width - 24 }
    }));
    this.phraseBox = this.decorateUiObject(this.scene.add.rectangle(this.layout.x + 12, this.layout.y + 88, this.layout.width - 24, 44, this.hex(palette.phraseBg), 0.9).setOrigin(0));
    this.phraseBox.setStrokeStyle(2, this.hex(palette.phraseBorder), 0.85);
    this.phraseText = this.decorateUiObject(this.scene.add.text(this.layout.x + 20, this.layout.y + 97, "", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: palette.tokenText
    }));
    this.actionButtonBg = this.createButtonBox(this.layout.x + this.layout.width - 174, this.layout.y + this.layout.height - 54, 162, 40, palette.actionIdleBg);
    this.actionButtonText = this.createButtonText(this.layout.x + this.layout.width - 174, this.layout.y + this.layout.height - 54, 162, 40, currentActionLabel(this.currentStage()), palette.actionText);
    this.resetButtonBg = this.createButtonBox(this.layout.x + this.layout.width - 344, this.layout.y + this.layout.height - 54, 162, 40, palette.resetBg);
    this.resetButtonText = this.createButtonText(this.layout.x + this.layout.width - 344, this.layout.y + this.layout.height - 54, 162, 40, "Reset", palette.resetText);

    [this.panelBg, this.titleText, this.promptText, this.helperText, this.phraseBox, this.phraseText, this.actionButtonBg, this.actionButtonText, this.resetButtonBg, this.resetButtonText].forEach(object => this.objects.push(object));

    this.actionButtonBg.setInteractive({ useHandCursor: true }).on("pointerup", () => this.onActionClicked());
    this.resetButtonBg.setInteractive({ useHandCursor: true }).on("pointerup", () => this.resetStage());
  }

  private renderStage() {
    this.clearStageObjects();

    const stage = this.currentStage();
    const palette = stage.palette;
    this.promptText.setText(stage.prompt);
    this.helperText.setText(stage.kind === "arrange" ? "Build the phrase in order." : "Choose the correct answer.");

    if (stage.kind === "arrange") {
      this.renderArrangeStage(stage, palette);
    } else {
      this.renderChoiceStage(stage, palette);
    }

    this.refreshActionButton();
    this.setVisible(!this.hidden);
  }

  private renderArrangeStage(stage: RouteArrangeStage, palette: RouteArrangeStage["palette"]) {
    this.phraseText.setText(this.selectedTokenIds.length > 0 ? this.selectedTokenIds.map(id => this.labelForToken(stage, id)).join(" ") : "Selected phrase will appear here.");
    const tokenAreaX = this.layout.x + 12;
    const tokenAreaY = this.layout.y + 144;
    const tokenAreaWidth = this.layout.width - 24;
    const buttonWidth = 120;
    const buttonHeight = 34;
    const gap = 10;
    let cursorX = tokenAreaX;
    let cursorY = tokenAreaY;

    for (const token of stage.tokens) {
      const selected = this.selectedTokenIds.includes(token.id);
      const tokenText = this.scene.add.text(0, 0, token.label, {
        fontFamily: "monospace",
        fontSize: "16px",
        color: palette.tokenText
      });
      const width = Math.max(buttonWidth, tokenText.width + 24);
      tokenText.destroy();

      if (cursorX + width > tokenAreaX + tokenAreaWidth) {
        cursorX = tokenAreaX;
        cursorY += buttonHeight + gap;
      }

      const bg = this.createButtonBox(cursorX, cursorY, width, buttonHeight, selected ? palette.tokenSelectedBg : palette.tokenIdleBg, palette.tokenBorder);
      const label = this.createButtonText(cursorX, cursorY, width, buttonHeight, token.label, palette.tokenText);
      if (!selected) {
        bg.setInteractive({ useHandCursor: true }).on("pointerup", () => {
          this.selectToken(token.id);
        });
      } else {
        bg.setAlpha(0.8);
      }

      this.stageObjects.push(bg, label);
      cursorX += width + gap;
    }
  }

  private renderChoiceStage(stage: RouteChoiceStage, palette: RouteChoiceStage["palette"]) {
    this.phraseText.setText(this.selectedChoiceId ? this.choiceLabel(stage, this.selectedChoiceId) : "Pick the correct option.");
    const leftColumnX = this.layout.x + 12;
    const leftColumnY = this.layout.y + 72;
    const leftColumnWidth = Math.max(230, Math.floor((this.layout.width - 36) * 0.42));
    const rightColumnX = leftColumnX + leftColumnWidth + 18;
    const rightColumnWidth = this.layout.x + this.layout.width - 12 - rightColumnX;
    const optionY = this.layout.y + 70;
    const optionHeight = 36;
    const columnGap = 10;
    const rowGap = 10;
    const measuredWidth = Math.max(
      ...stage.choices.map((choice, index) => this.measureChoiceWidth(`${String.fromCharCode(65 + index)}. ${choice.label}`))
    );
    const optionWidth = Math.min(220, Math.max(150, measuredWidth + 24));
    const totalWidth = optionWidth * 2 + columnGap;
    const startX = rightColumnX + Math.max(0, Math.floor((rightColumnWidth - totalWidth) / 2));

    this.phraseBox.setPosition(leftColumnX, leftColumnY);
    this.phraseBox.setSize(leftColumnWidth, 40);
    this.phraseText.setPosition(leftColumnX + 8, leftColumnY + 10);
    this.phraseText.setWordWrapWidth(leftColumnWidth - 16);
    this.promptText.setPosition(leftColumnX, this.layout.y + 32);
    this.promptText.setWordWrapWidth(leftColumnWidth);
    this.helperText.setPosition(leftColumnX, this.layout.y + 54);
    this.helperText.setWordWrapWidth(leftColumnWidth);

    stage.choices.forEach((choice, index) => {
      const x = startX + (index % 2) * (optionWidth + columnGap);
      const y = optionY + Math.floor(index / 2) * (optionHeight + rowGap);
      const isSelected = this.selectedChoiceId === choice.id;
      const isCorrect = choice.correct && isSelected;
      const bgColor = isCorrect
        ? palette.choiceCorrectBg
        : isSelected
          ? palette.choiceWrongBg
          : palette.choiceIdleBg;
      const bg = this.createButtonBox(x, y, optionWidth, optionHeight, bgColor, palette.tokenBorder);
      const label = this.createButtonText(x, y, optionWidth, optionHeight, `${String.fromCharCode(65 + index)}. ${choice.label}`, palette.tokenText);
      bg.setInteractive({ useHandCursor: true }).on("pointerup", () => {
        this.selectChoice(choice.id);
      });
      this.stageObjects.push(bg, label);
    });
  }

  private selectToken(tokenId: string) {
    if (this.selectedTokenIds.includes(tokenId)) {
      return;
    }

    this.selectedTokenIds = [...this.selectedTokenIds, tokenId];
    this.renderStage();
  }

  private selectChoice(choiceId: string) {
    this.selectedChoiceId = choiceId;
    this.renderStage();
  }

  private onActionClicked() {
    if (!this.hasAttempt()) {
      return;
    }

    if (!this.isStageReady()) {
      this.onResolve(false);
      return;
    }

    if (this.stageIndex < this.definition.stages.length - 1) {
      this.stageIndex += 1;
      this.selectedTokenIds = [];
      this.selectedChoiceId = null;
      this.renderStage();
      return;
    }

    this.onResolve(true);
  }

  private resetStage() {
    this.selectedTokenIds = [];
    this.selectedChoiceId = null;
    this.renderStage();
  }

  private refreshActionButton() {
    const stage = this.currentStage();
    const ready = this.isStageReady();
    const palette = stage.palette;
    const actionLabel = currentActionLabel(stage);
    this.actionButtonBg.setFillStyle(this.hex(ready ? palette.actionReadyBg : palette.actionIdleBg), 1);
    this.actionButtonText.setText(actionLabel);
    this.actionButtonText.setColor(palette.actionText);
  }

  private isStageReady() {
    const stage = this.currentStage();
    if (stage.kind === "arrange") {
      if (this.selectedTokenIds.length !== stage.answerTokenIds.length) {
        return false;
      }

      return stage.answerTokenIds.every((id, index) => this.selectedTokenIds[index] === id);
    }

    if (!this.selectedChoiceId) {
      return false;
    }

    return stage.choices.some(choice => choice.id === this.selectedChoiceId && choice.correct);
  }

  private hasAttempt() {
    const stage = this.currentStage();
    if (stage.kind === "arrange") {
      return this.selectedTokenIds.length === stage.answerTokenIds.length;
    }

    return this.selectedChoiceId !== null;
  }

  private labelForToken(stage: RouteArrangeStage, tokenId: string) {
    return stage.tokens.find(token => token.id === tokenId)?.label ?? tokenId;
  }

  private choiceLabel(stage: RouteChoiceStage, choiceId: string) {
    return stage.choices.find(choice => choice.id === choiceId)?.label ?? choiceId;
  }

  private currentStage() {
    return this.definition.stages[this.stageIndex];
  }

  private clearStageObjects() {
    for (const object of this.stageObjects) {
      object.destroy();
    }
    this.stageObjects.length = 0;
  }

  private createButtonBox(x: number, y: number, width: number, height: number, fill: string, stroke = fill) {
    const box = this.decorateUiObject(this.scene.add.rectangle(x, y, width, height, this.hex(fill), 1).setOrigin(0));
    box.setStrokeStyle(2, this.hex(stroke), 0.95);
    return box;
  }

  private createButtonText(x: number, y: number, width: number, height: number, text: string, color: string) {
    return this.decorateUiObject(this.scene.add.text(x + width / 2, y + height / 2, text, {
      fontFamily: "monospace",
      fontSize: "14px",
      color
    }).setOrigin(0.5));
  }

  private measureChoiceWidth(text: string) {
    const measure = this.scene.add.text(0, 0, text, {
      fontFamily: "monospace",
      fontSize: "14px"
    });
    const width = measure.width;
    measure.destroy();
    return width;
  }

  private hex(color: string) {
    return Phaser.Display.Color.HexStringToColor(color).color;
  }

  private decorateUiObject<T extends Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text>(object: T) {
    object.setScrollFactor(0);
    object.setDepth(this.uiDepth);
    return object;
  }
}

function currentActionLabel(stage: RouteStage) {
  return stage.actionLabel ?? (stage.kind === "choice" ? "Continue" : "Continue");
}
