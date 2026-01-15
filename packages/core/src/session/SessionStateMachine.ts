import { SessionState } from './types';

export class SessionStateMachine {
    private _currentState: SessionState;
    private allowedTransitions: Record<SessionState, SessionState[]>;

    constructor(initialState: SessionState = SessionState.PENDING) {
        this._currentState = initialState;

        // Define allowed transitions graph
        this.allowedTransitions = {
            [SessionState.PENDING]: [SessionState.INITIALIZING, SessionState.FAILED],
            [SessionState.INITIALIZING]: [SessionState.PRIMACY, SessionState.FAILED],
            [SessionState.PRIMACY]: [SessionState.ACTIVE, SessionState.FAILED],
            [SessionState.ACTIVE]: [SessionState.SUMMARIZING, SessionState.FAILED],
            [SessionState.SUMMARIZING]: [SessionState.CLOSED, SessionState.FAILED],
            [SessionState.CLOSED]: [], // Terminal state
            [SessionState.FAILED]: [SessionState.CLOSED] // Can clean up a failed session
        };
    }

    get state(): SessionState {
        return this._currentState;
    }

    canTransitionTo(targetState: SessionState): boolean {
        const allowed = this.allowedTransitions[this._currentState];
        return allowed.includes(targetState);
    }

    transitionTo(targetState: SessionState): void {
        if (!this.canTransitionTo(targetState)) {
            throw new Error(`Invalid state transition: Cannot move from ${this._currentState} to ${targetState}`);
        }
        this._currentState = targetState;
    }
}
