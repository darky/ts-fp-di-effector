import { createEffect, createEvent, createStore, Effect, Event, is, Store } from "effector";
import { diInit } from "ts-fp-di";
import { test } from "uvu";
import { equal, throws } from "uvu/assert";

import { diEffector, diEffectorClean, diEffectorExpose } from "./index.js";

test("diEffector onCreateEvent", () => {
  diInit(() => {
    let event!: Event<any>;
    let label = "";

    const diEff = diEffector({
      onCreateEvent: (lbl, ev) => {
        label = lbl;
        event = ev;
      },
      onCreateEffect: () => {},
      onCreateStore: () => {},
    });

    const getEvent = diEff("event", () => createEvent());
    const ev = getEvent();
    equal(is.event(ev), true);
    equal(event, ev);
    equal(event.sid, "event");
    equal(label, "event");
  });
});

test("diEffector onCreateEffect", () => {
  diInit(() => {
    let effect!: Effect<any, any, any>;
    let label = "";

    const diEff = diEffector({
      onCreateEvent: () => {},
      onCreateEffect: (lbl, eff) => {
        label = lbl;
        effect = eff;
      },
      onCreateStore: () => {},
    });

    const getEffect = diEff("effect", () => createEffect());
    const eff = getEffect();
    equal(is.effect(eff), true);
    equal(effect, eff);
    equal(effect.sid, "effect");
    equal(label, "effect");
  });
});

test("diEffector onCreateStore", () => {
  diInit(() => {
    let store!: Store<any>;
    let label = "";

    const diEff = diEffector({
      onCreateEvent: () => {},
      onCreateEffect: () => {},
      onCreateStore: (lbl, s) => {
        label = lbl;
        store = s;
      },
    });

    const getStore = diEff("store", () => createStore(null));
    const s = getStore();
    equal(is.store(s), true);
    equal(store, s);
    equal(store.sid, "store");
    equal(label, "store");
  });
});

test("diEffectorClean", () => {
  diInit(() => {
    const diEff = diEffector({
      onCreateEvent: () => {},
      onCreateEffect: () => {},
      onCreateStore: () => {},
    });

    const event = diEff("event", () => createEvent())();
    const store = diEff("store", () => createStore(0).on(event, (n) => n + 1))();

    event();

    diEffectorClean();

    event();

    equal(store.getState(), 1);
  });
});

test("diEffectorClean error without diInit", () => {
  throws(() => diEffectorClean());
});

test("diEffector error without diInit", () => {
  const diEff = diEffector({
    onCreateEvent: () => {},
    onCreateEffect: () => {},
    onCreateStore: () => {},
  });

  throws(() => diEff("", () => createStore(null))());
});

test("diEffector cache", () => {
  const diEff = diEffector({
    onCreateEvent: () => {},
    onCreateEffect: () => {},
    onCreateStore: () => {},
  });

  diInit(() => {
    let i = 0;

    const getStore = diEff("", () => {
      i++;
      return createStore(null);
    });

    const store1 = getStore();
    const store2 = getStore();
    equal(store1, store2);
    equal(i, 1);
  });
});

test("diEffector params typing", () => {
  diInit(() => {
    const diEff = diEffector({
      onCreateEvent: () => {},
      onCreateEffect: () => {},
      onCreateStore: () => {},
    });

    const getStore = diEff("", (n: number) => createStore(n));

    equal(getStore(1).getState(), 1);
  });
});

test("diEffectorExpose simple", () => {
  diInit(() => {
    const diEff = diEffector({
      onCreateEvent: () => {},
      onCreateEffect: () => {},
      onCreateStore: () => {},
    });

    diEff("", () => createStore(0))();

    equal(is.store(diEffectorExpose()?.[0]), true);
  });
});

test("diEffectorExpose error without diInit", () => {
  throws(() => diEffectorExpose());
});

test.run();
