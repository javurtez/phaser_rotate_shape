import Constants from "../../Constants";
import Utilities from "../../Utilities";
import AudioManager from "../Managers/AudioManager";
import MenuScene from "./MenuScene";

export default class GameScene extends Phaser.Scene {
    /**
     * Unique name of the scene.
     */
    public static Name = "MainGame";

    rotationDirection: number;
    rotationSpeed: number;
    score: number;
    maxScore: number;
    scoreTxt: Phaser.GameObjects.Text;
    maxScoreText: Phaser.GameObjects.Text;
    targetCircle: Phaser.GameObjects.Sprite;
    circleContainer: Phaser.GameObjects.Container;
    targetContainer: Phaser.GameObjects.Container;
    index: number;
    angleArray: number[];
    jsonPosition: any;

    public create(): void {
        Utilities.LogSceneMethodEntry("MainGame", "create");

        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor(Constants.BackgroundHex);

        const screenCenterX = this.cameras.main.centerX;
        const screenCenterY = this.cameras.main.centerY;

        this.rotationDirection = -1;
        this.rotationSpeed = 1.0;

        this.score = 0;
        this.maxScore = parseInt(localStorage.getItem(Constants.ScoreSaveKey)) || 0;

        this.jsonPosition = this.cache.json.get('position');

        this.scoreTxt = this.add.text(this.jsonPosition["scoreText"].positionX, this.jsonPosition["scoreText"].positionY, this.jsonPosition["scoreText"].text + 0).setOrigin(0, .5);
        this.scoreTxt.setFontSize(parseInt(this.jsonPosition["scoreText"].size));
        this.scoreTxt.setFontFamily(this.jsonPosition["maxScoreText"].font);
        this.maxScoreText = this.add.text(this.jsonPosition["maxScoreText"].positionX, this.jsonPosition["maxScoreText"].positionY, this.jsonPosition["maxScoreText"].text + this.maxScore).setOrigin(0, .5);
        this.maxScoreText.setFontSize(parseInt(this.jsonPosition["maxScoreText"].size));
        this.maxScoreText.setFontFamily(this.jsonPosition["maxScoreText"].font);

        var circle = this.add.sprite(-2000, screenCenterY, "circleImg").setOrigin(0.5).setScale(.5);
        this.targetCircle = this.add.sprite(0, 0, "dotImg").setScale(.12);
        var line = this.add.sprite(0, 0, "lineImg").setScale(.5, .51);
        var dot = this.add.sprite(0, 0, "dotImg").setScale(.12);

        dot.setTint(0x938683);
        line.setTint(0x938683);
        this.targetCircle.setTint(0xCC6464);

        this.circleContainer = this.add.container(-2000, screenCenterY, [dot, line]);
        dot.y -= 145;
        line.y -= 15;

        this.targetContainer = this.add.container(-2000, screenCenterY, [this.targetCircle]);
        this.targetCircle.y -= 145;

        this.index = 0;
        this.angleArray = [100, 8, 300, 45, 280];

        this.SetRandomAngle();

        this.tweens.add({
            targets: [this.circleContainer, this.targetContainer],
            x: screenCenterX,
            ease: 'Linear',
            delay: 0,
            duration: 1000,
        });
        this.tweens.add({
            targets: [circle],
            x: screenCenterX,
            ease: 'Linear',
            delay: 0,
            duration: 1000,
        });

        this.input.on('pointerdown', () => {
            if (this.CheckTargetAngle()) {
                console.log("Hit");
                this.rotationDirection *= -1;
                this.rotationSpeed += .1;
                this.rotationSpeed = Phaser.Math.Clamp(this.rotationSpeed, 1, 10);
                this.SetRandomAngle();
                this.UpdateScore();
            }
            else {
                this.GameOver();
            }
        }, this);
    }

    update() {
        if (this.tweens.isTweening(this.circleContainer)) return;

        this.circleContainer.rotation += 0.01 * this.rotationDirection * this.rotationSpeed;
    }

    private GameOver(): void {
        AudioManager.Instance.PlaySFXOneShot(this, "hurt");
        this.scene.start(MenuScene.Name);
        if (this.maxScore < this.score) {
            localStorage.setItem(Constants.ScoreSaveKey, this.score.toString());
        }
    }
    private UpdateScore(): void {
        this.score++;
        this.scoreTxt.setText(this.jsonPosition["scoreText"].text + this.score);
        AudioManager.Instance.PlaySFXOneShot(this, "points");
        if (this.maxScore < this.score) {
            this.maxScoreText.setText(this.jsonPosition["maxScoreText"].text + this.score);
        }
    }
    private CheckTargetAngle(): boolean {
        var angleDistance = (this.circleContainer.angle % 360) - this.targetContainer.angle;
        return Math.abs(angleDistance) <= 15;
    }
    private SetRandomAngle(): void {
        if (this.angleArray.length - 1 > this.index) {
            this.targetContainer.rotation = this.angleArray[this.index];
            this.index++;
            return;
        }
        this.targetContainer.rotation = Phaser.Math.Between(0, 360);
    }
}