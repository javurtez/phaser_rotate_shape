import Constants from "../../Constants";
import Utilities from "../../Utilities";
import AudioManager from "../Managers/AudioManager";
import GameScene from "./GameScene";

export default class MenuScene extends Phaser.Scene {
    /**
     * Unique name of the scene.
     */
    public static Name = "MainMenu";
    maxScore: number;
    maxScoreText: Phaser.GameObjects.Text;

    public create(): void {
        Utilities.LogSceneMethodEntry("MainMenu", "create");

        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor(Constants.BackgroundHex);

        const screenCenterX = this.cameras.main.centerX;

        var jsonPosition = this.cache.json.get('position');

        AudioManager.Instance.PlayBGM(this, "bgm", false);

        this.maxScore = parseInt(localStorage.getItem(Constants.ScoreSaveKey)) || 0;
        
        this.maxScoreText = this.add.text(jsonPosition["maxScoreText"].positionX, jsonPosition["maxScoreText"].positionY, jsonPosition["maxScoreText"].text + this.maxScore).setOrigin(0, .5);
        this.maxScoreText.setFontSize(jsonPosition["maxScoreText"].size);
        this.maxScoreText.setFontFamily(jsonPosition["maxScoreText"].font);

        var playButton = this.add.sprite(screenCenterX, jsonPosition["playImage"].positionY, "playBtn").
            setOrigin(0.5).
            setScale(0).
            setInteractive().
            on('pointerdown', () => this.OnStart(playButton)).
            on('pointerover', () => this.OnHoverStart(playButton)).
            on('pointerout', () => this.OnExitStart(playButton));

        var clearButton = this.add.text(55, -15, "Clear Score").setOrigin(.5).
            setInteractive().
            on('pointerdown', () => {
                localStorage.clear();
                this.maxScoreText.setText("Max Score 0");
            }).
            on('pointerover', () => {
                clearButton.setStyle({ fill: '#ff0' });
            }).
            on('pointerout', () => {
                clearButton.setStyle({ fill: '#fff' });
            });

        this.tweens.add({
            targets: playButton,
            scale: .4,
            ease: 'Linear',
            duration: 300,
        });
    }

    private OnStart(btn: Phaser.GameObjects.Sprite) {
        if (this.tweens.isTweening(btn)) return;
        if (!btn) return;

        AudioManager.Instance.PlaySFXOneShot(this, 'click');
        this.tweens.add({
            targets: btn,
            x: -2000,
            ease: 'Linear',
            duration: 1000,
            onComplete: () => this.scene.start(GameScene.Name),
        });
    }
    private OnHoverStart(btn: Phaser.GameObjects.Sprite) {
        if (!btn) return;
        btn.setTintFill(0xff0000);
    }
    private OnExitStart(btn: Phaser.GameObjects.Sprite) {
        if (!btn) return;
        btn.clearTint();
    }
}