import { EventDispatcher } from '../core/EventDispatcher';
export declare class KeyInputControl extends EventDispatcher {
    isDisabled: boolean;
    private isUp;
    private isDown;
    private isLeft;
    private isRight;
    private isMoveKeyHolding;
    frontAngle: number;
    private _keydownListener;
    private _keyupListener;
    private _blurListener;
    constructor();
    jump(): void;
    updateAngle(): void;
    dispose(): void;
}
