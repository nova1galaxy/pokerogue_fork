import { globalScene } from "#app/global-scene";
import type { UiMode } from "#enums/ui-mode";
import type { InputFieldConfig } from "#ui/form-modal-ui-handler";
import { FormModalUiHandler } from "#ui/form-modal-ui-handler";
import type { ModalConfig } from "#ui/modal-ui-handler";
import i18next from "i18next";

interface BuildInteractableImageOpts {
  scale?: number;
  x?: number;
  y?: number;
  origin?: { x: number; y: number };
}

/**
 * The maximum number of saves that are allowed to show up in the username panel pefore
 * the `P02: Too many saves` popup is displayed.
 *
 * @privateRemarks
 * This limitation is in place to allow for the password reset helpers to get
 * enough information in one screenshot. If the user has too many saves, this
 * complicates the interaction as it would require scrolling, which will
 * make tickets take longer to resolve.
 */

export class LoginFormUiHandler extends FormModalUiHandler {
  private readonly ERR_USERNAME: string = "invalid username";
  private readonly ERR_PASSWORD: string = "invalid password";
  private readonly ERR_ACCOUNT_EXIST: string = "account doesn't exist";
  private readonly ERR_PASSWORD_MATCH: string = "password doesn't match";
  private readonly ERR_NO_SAVES: string = "No save files found";
  private readonly ERR_TOO_MANY_SAVES: string = "Too many save files found";

  private usernameInfoImage: Phaser.GameObjects.Image;
  private saveDownloadImage: Phaser.GameObjects.Image;
  private changeLanguageImage: Phaser.GameObjects.Image;
  private infoContainer: Phaser.GameObjects.Container;
  constructor(mode: UiMode | null = null) {
    super(mode);
  }

  setup(): void {
    super.setup();

    this.buildInfoContainer();
  }

  private buildInfoContainer() {
    this.infoContainer = globalScene.add.container(0, 0);

    this.usernameInfoImage = this.buildInteractableImage("settings_icon", "username-info-icon", {
      x: 20,
      scale: 0.5,
    });

    this.saveDownloadImage = this.buildInteractableImage("saving_icon", "save-download-icon", {
      x: 0,
      scale: 0.75,
    });

    this.changeLanguageImage = this.buildInteractableImage("language_icon", "change-language-icon", {
      x: 40,
      scale: 0.5,
    });

    this.infoContainer
      .add([this.usernameInfoImage, this.saveDownloadImage, this.changeLanguageImage])
      .setVisible(false)
      .disableInteractive();
    this.getUi().add(this.infoContainer);
  }

  override getModalTitle(_config?: ModalConfig): string {
    return "Choix du nom d'utilisateur";
  }

  override getWidth(_config?: ModalConfig): number {
    return 160;
  }

  override getMargin(_config?: ModalConfig): [number, number, number, number] {
    return [0, 0, 48, 0];
  }

  override getButtonLabels(_config?: ModalConfig): string[] {
    return ["Commencer"];
  }

  override getReadableErrorMessage(error: string): string {
    const colonIndex = error?.indexOf(":");
    if (colonIndex > 0) {
      error = error.slice(0, colonIndex);
    }
    switch (error) {
      case this.ERR_USERNAME:
        return i18next.t("menu:invalidLoginUsername");
      case this.ERR_PASSWORD:
        return i18next.t("menu:invalidLoginPassword");
      case this.ERR_ACCOUNT_EXIST:
        return i18next.t("menu:accountNonExistent");
      case this.ERR_PASSWORD_MATCH:
        return i18next.t("menu:unmatchingPassword");
      case this.ERR_NO_SAVES:
        return "P01: " + i18next.t("menu:noSaves");
      case this.ERR_TOO_MANY_SAVES:
        return "P02: " + i18next.t("menu:tooManySaves");
    }

    return super.getReadableErrorMessage(error);
  }

  override getInputFieldConfigs(): InputFieldConfig[] {
    const inputFieldConfigs: InputFieldConfig[] = [];
    inputFieldConfigs.push({ label: i18next.t("menu:username") });
    return inputFieldConfigs;
  }

  override show(args: any[]): boolean {
    if (!super.show(args)) {
      return false;
    }
    this.submitAction = () => {
      if (globalScene.tweens.getTweensOf(this.modalContainer).length > 0) {
        return;
      }
      this.sanitizeInputs();
      if (!this.inputs[0].text) {
        globalScene.ui.playError();
        return;
      }
      const user_name = this.inputs[0].text;
      try {
        localStorage.setItem("offlineUsername", user_name);
        location.reload();
      } catch (err) {
        console.error(err);
        globalScene.ui.playError();
      }
    };

    return true;
  }

  override clear() {
    super.clear();
    this.infoContainer.setVisible(false).setActive(false);
    this.setMouseCursorStyle("default"); //reset cursor

    [this.usernameInfoImage, this.saveDownloadImage, this.changeLanguageImage].forEach(img => {
      img.off("pointerdown");
    });
  }

  override destroy() {
    super.destroy();
    this.infoContainer.destroy();
  }

  /**
   * Collect the user's save files from localStorage and download them as a zip file
   *
   * @remarks
   * Used as the `pointerDown` callback for the save download image
   * @param config - The modal configuration
   */

  private buildInteractableImage(texture: string, name: string, opts: BuildInteractableImageOpts = {}) {
    const { scale = 0.07, x = 0, y = 0, origin = { x: 0, y: 0 } } = opts;
    const img = globalScene.add
      .image(x, y, texture)
      .setName(name)
      .setOrigin(origin.x, origin.y)
      .setScale(scale)
      .setInteractive();
    this.addInteractionHoverEffect(img);

    return img;
  }
}
