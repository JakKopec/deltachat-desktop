import { useRef } from 'react'
import { useState, useEffect, useLayoutEffect } from 'react'
import { getLogger, Logger } from '../../shared/logger'

export type ActionType = string
export type ActionPayload = any | undefined
export type ActionId = number | undefined
export interface Action {
  type: ActionType
  payload: ActionPayload
  id: ActionId
}

export interface EffectInterface<S>{
  (action: Action, state: S, log: ReturnType<typeof getLogger>) : Promise<S>
}


export interface StoreListener<S>{
  onStateChange: (state: S) => void,
  onForceTriggerEffect: () => void,
  onPushEffect: (a: Action) => void,
  onPushLayoutEffect: (a: Action) => void
}

export interface StoreDispatchSetState<S> {
  (state: S) : Promise<void>
}

export interface OnDispatchParameters {
  currentlyDispatchedCounter: number,
  incrementingDispatchedCounter: number,
  name: string
}

export interface OnDispatchCheck {
  (checkState: OnDispatchParameters): boolean
}

export interface BeforeSetStateParameters {
  currentlyDispatchedCounter: number,
  incrementingDispatchedCounter: number,
  yourIncrementingDispatchedCounter: number,
  name: string
}

export interface BeforeSetStateCheck {
  (checkState: BeforeSetStateParameters): boolean
}

export class Store<S> {
  private listeners: StoreListener<S>[] = []
  private effects: {[key: string]: EffectInterface<S>} = {}
  private _log: ReturnType<typeof getLogger>
  private currentlyDispatchedCounter = 0
  private incrementingDispatchedCounter = 0
  
  constructor(public state: S, name?: string) {
    if (!name) name = 'Store2'
    this._log = getLogger('renderer/stores/' + name)
    this.init()
  }

  init() {}
  destroy() {}

  private get log() {
    return this._log
  }

  getState() {
    return this.state
  }

  async dispatch(name: string, effect: (state: S, setState: StoreDispatchSetState<S>) => Promise<void>, onDispatchCheck?: OnDispatchCheck, beforeSetStateCheck?: BeforeSetStateCheck): Promise<void> {
    this.log.debug('DISPATCH of type', name)
    const self = this
    
    if (onDispatchCheck) {
      const shouldDispatch = onDispatchCheck({
        currentlyDispatchedCounter: this.currentlyDispatchedCounter,
        incrementingDispatchedCounter: this.incrementingDispatchedCounter,
        name
      })

      if (!shouldDispatch) {
        this.log.debug(
          `DISPATCHING of "${name}" aborted. onDispatchCheck was false.`,
        )
        return
      }
    }
    
    let yourIncrementingDispatchedCounter = this.incrementingDispatchedCounter++
    if (yourIncrementingDispatchedCounter >= Number.MAX_SAFE_INTEGER - 1) {
      yourIncrementingDispatchedCounter = this.incrementingDispatchedCounter = 0
    }
    this.currentlyDispatchedCounter++

    const setState = async (updatedState: S) => {
      if (updatedState === this.state) {
        this.log.debug(
          `DISPATCHING of "${name}" didn't change the state. Returning.`,
        )
        return
      }
      this.log.debug(
        `DISPATCHING of "${name}" changed the state. Before:`,
        this.state,
        'After:',
        updatedState
      )

      if (beforeSetStateCheck) {
        const shouldSetState = beforeSetStateCheck({
          currentlyDispatchedCounter: self.currentlyDispatchedCounter,
          incrementingDispatchedCounter: self.incrementingDispatchedCounter,
          yourIncrementingDispatchedCounter,
          name
        })
        
        if(!shouldSetState) {
          this.log.debug(
            `DISPATCHING of "${name}" aborted. beforeSetStateCheck was false.`,
          )
          return
        }
      }
      await this.setState(async (state) => {
        return updatedState
      }) 

    }

    await effect.call(self, self.state, setState)
    this.currentlyDispatchedCounter--
  }
  

  private subscribe(listener: StoreListener<S>) {
    this.listeners.push(listener)
    return this.unsubscribe.bind(this, listener)
  }

  private unsubscribe(listener: StoreListener<S>) {
    const index = this.listeners.indexOf(listener)
    this.listeners.splice(index, 1)
  }

  async setState(cb: (state: S) => Promise<S> | S) {
    const updatedState = await cb(this.state)
    if (!updatedState || updatedState === this.state) {
      this.log.info('setState: state didn\'t change')
      return
    }
    this.log.info('setState: state changed')
    this.state = updatedState
    for(let listener of this.listeners) {
      listener.onStateChange(this.state)
    }
  }
  
  async pushEffect(action: Action, forceUpdate?: boolean) {
    this.log.info(`pushEffect: pushed effect ${action.type} ${action}`)
    for(let listener of this.listeners) {
      listener.onPushEffect(action)
    }
    if (forceUpdate === true) {
      for(let listener of this.listeners) {
        listener.onForceTriggerEffect()
      }
    }
  }

  async pushLayoutEffect(action: Action, forceUpdate?: boolean) {
    this.log.info(`pushLayoutEffect: pushed layout effect ${action.type} ${action}`)
    for(let listener of this.listeners) {
      listener.onPushLayoutEffect(action)
    }
    if (forceUpdate === true) {
      for(let listener of this.listeners) {
        listener.onForceTriggerEffect()
      }
    }
  }

  useStore(onAction?: (action: Action) => void, onLayoutAction?: (action: Action) => void): S {
    const self = this
    console.log(self)
    const [state, setState] = useState(self.getState())
    const [forceTriggerEffect, setForceTriggerEffect] = useState(false)
    const effectQueue = useRef<Action[]>([])
    const layoutEffectQueue = useRef<Action[]>([])

    useEffect(() => {
      return self.subscribe({
        onStateChange: setState,
        onForceTriggerEffect: () => setForceTriggerEffect(prevState => !prevState),
        onPushEffect: (a) => effectQueue.current.push(a),
        onPushLayoutEffect: (a) => layoutEffectQueue.current.push(a)
      })
    }, [])
    
    useEffect(() => {
      this.log.debug('useEffect')
      
      while (effectQueue.current.length > 0) {
        onAction(effectQueue.current.pop())
      }
    }, [state, forceTriggerEffect])
    
    useLayoutEffect(() => {
      this.log.debug('useLayoutEffect')
      while (layoutEffectQueue.current.length > 0) {
        onLayoutAction(layoutEffectQueue.current.pop())
      }
    }, [state, forceTriggerEffect])

    return state
  }
}