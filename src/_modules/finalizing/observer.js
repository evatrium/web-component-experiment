import {isObj, isArray} from "./utils";

export const observer = (target, cb) => {
    let subs = [],
        unsub = (sub, out) => {
            out = [];
            for (let i = 0; i < subs.length; i++)
                if (subs[i] === sub) sub = null; else out.push(subs[i]);
            subs = out;
        },
        sub = (sub) => (subs.push(sub), () => unsub(sub)),
        notify = (data) => subs.forEach(s => s && s(data)),
        makeFakeProxy = (obj) => {
        for (let propKey in obj) {
            let internalValue = obj[propKey];
            if (typeof internalValue === 'function') return;
            if (isObj(internalValue)) internalValue = makeFakeProxy(internalValue);
            Object.defineProperty(obj, propKey, {
                enumerable: true,
                get: () => internalValue,
                set: (value) => (value !== internalValue)
                    && (internalValue = value, notify(target)),
            });
        }
        return obj
    };
    if (isArray(target)) target.forEach(o => makeFakeProxy(o));
    else makeFakeProxy(target);
    cb && cb(target);
    return (cb) => sub(cb)
};

export const observable = (targetState) => {
    let observe = observer(targetState);
    Object.defineProperty(targetState, '$onChange', {
        enumerable: false,
        value: (updater) => observe(updater)
    });
    return targetState;
};
export const Observe = (thing) => {
    return (clazz) => {
        clazz.observe = thing
    }
};


// export const observable = (targetState) => {
//     let observe = observer(targetState);
//     const WatchSelected = (state, mapper, changeCB) => {
//         state = mapper(state);
//         return (stateUpdate) => {
//             let mapped = mapper(stateUpdate);
//             for (let i in mapped) if (mapped[i] !== state[i]) {
//                 state = mapped;
//                 return changeCB(state)
//             }
//             for (let i in state) if (!(i in mapped)) {
//                 state = mapped;
//                 return changeCB(state)
//             }
//         }
//     };
//     Object.defineProperty(targetState, '$onChange', {
//         enumerable: false,
//         value: (updater, select) => observe(
//             select ? WatchSelected(targetState, select, updater) : updater
//         )
//     });
//     return targetState;
// };





// const dotWalk = (obj, dots) => dots.split('.').reduce((o, i) => o[i], obj);




// const observable = (targetState) => {
//     let observe = observer(targetState);
//     const WatchSelected = (state, mapper, changeCB) => {
//         state = mapper(state);
//         return (stateUpdate) => {
//             let mapped = mapper(stateUpdate);
//             for (let i in mapped) if (mapped[i] !== state[i]) {
//                 state = mapped;
//                 return changeCB(state)
//             }
//             for (let i in state) if (!(i in mapped)) {
//                 state = mapped;
//                 return changeCB(state)
//             }
//         }
//     };
//     Object.defineProperty(targetState, '$onChange', {
//         enumerable: false,
//         value: (updater, select) => observe(
//             select ? WatchSelected(targetState, select, updater) : updater
//         )
//     });
//     return targetState;
// };
//
// const access = {
//     isLoggedIn
// }
//
//
//
//
//
//
// class LoginPage extends Elemental{
//
// }
//
//
// class OnBoardingPage extends Elemental{
//
// }
//















// JSConf meta programming
//https://www.youtube.com/watch?v=_5X2aB_mNp4
//
/*
https://www.vuemastery.com/courses/advanced-components/build-a-reactivity-system/
 */

// let vehicle = {
//     make: 'honda',
//     model: 'civic',
//     user: {
//         firstName: 'wes',
//         lastName: 'ross',
//         some: {
//             nested: {
//                 value: 'hello'
//             }
//         }
//     }
// };
// const observer = observe(vehicle);
//
// observer((asdf) => console.error('state changed', asdf));
//
//
// console.log('vehicle', vehicle)
//
//
// vehicle.make = 'toyota';
//
// console.log('vehicle.user', vehicle.user)
// console.log('vehicle.user.firstName', vehicle.user.firstName)
//
// let {firstName, lastName, some} = vehicle.user;
//
// console.log('destructured', firstName, lastName);
//
// firstName = 'bob';
//
// some.nested.value = 'asdf';
//
// let user = vehicle.user;
//
// user.lastName = 'simson'
//
//
// let nested = vehicle.user.some.nested;
//
//
//
// nested.value = 'poop';


//
//
//
// class Tester{
//     constructor(obj){
//         Object.assign(this, obj);
//
//         let map = new Map();
//
//
//
//
//
//         for (let prop in this) {
//             let internalValue = this[prop];
//             Object.defineProperty(this, prop, {
//                 // writable:true,
//                 get() {
//                     return obj[prop]
//                 },
//                 set(value) {
//                     if (value !== this[prop]) {
//                         console.log(value, 'was updated');
//                         internalValue = value;
//                     }
//                 }
//             })
//         }
//
//
//         return this;
//     }
//
//
// }
//
// const poop = {
//     hello: 'asdf',
//     barf: 'poop'
// }
//
// const t = new Tester(poop);


// function tester(obj) {
//
//     Object.assign(this, obj);
//
//
//     for (let prop in this) {
//         let internalValue = this[prop];
//         Object.defineProperty(this, prop, {
//             // writable:true,
//             get() {
//                 return obj[prop]
//             },
//             set(value) {
//                 if (value !== this[prop]) {
//                     console.log(value, 'was updated');
//                     internalValue = value;
//                 }
//             }
//         })
//     }
//
//     this.merge = () => {
//         console.log('adsf')
//     }
//
//     return this;
// }
//
//
// const poop = {
//     hello: 'asdf',
//     barf: 'poop'
// }
//
//
// let derp = new tester(poop);
//
// console.log(derp)
// let {barf} = poop;
//
// derp.barf = 'whasdfasdf';
//
// derp.merge();


//
// let animal = {type: 'bird', flies: true, info: {origin: 'amazon'}}
//
//
// const makeProxy = (obj) =>{
//     for(let prop in obj){
//         let internalValue = obj[prop];
//
//         Object.defineProperty(obj, prop, {
//             value: function(newValue){
//                 console.log(this, newValue);
//
//                 return obj[prop];
//             }
//         });
//     }
//
// }
//
// makeProxy(animal)
//
// console.log(animal)
// console.log(animal.info('asdf'))


// const user = vehicle.user;
//
// console.log('user', user)


// export const observe = (obj, cb) => {
//     obj = obj || {};
//     let subs = [],
//         unsub = (sub) => {
//             let out = [];
//             for (let i = 0; i < subs.length; i++)
//                 if (subs[i] === sub) sub = null; else out.push(subs[i]);
//             subs = out;
//         },
//         sub = (sub) => (subs.push(sub), () => unsub(sub)),
//         notify = (data) => subs.forEach(s => s && s(data));
//
//
//
//     // sub(cb);
//
//     const makeProxy = (obj) => {
//         let propKeys = Object.keys(obj);
//         propKeys.forEach(propKey => {
//             if (isFunc(obj[propKey])) return;
//             if (obj[propKey] instanceof Object) return makeProxy(obj[propKey]);
//             let internalValue = obj[propKey];
//
//
//         });
//     };
//
//     //
//     // obj = new Proxy(obj, {
//     //     get(target, name, receiver) {
//     //         console.log('getting value', target[name], 'from prop',  name, 'on target', target);
//     //         // return target[name]
//     //         return Reflect.get(target, name, receiver);
//     //     },
//     //     set(target, name, value, receiver) {
//     //         console.log('setting value', value, 'on property', name, ' on target ', target);
//     //         const oldValue = target[name];
//     //         // target[name] = value;
//     //         Reflect.set(target, name, value, receiver);
//     //         if (value !== oldValue){
//     //             notify();
//     //         }
//     //         return true;
//     //     }
//     // });
//     // function buildProxy(o) {
//     //     return new Proxy(o, {
//     //         set(target, property, value, receiver) {
//     //             // same as above, but add prefix
//     //             cb('setting', receiver);
//     //             target[property] = value;
//     //             return true
//     //         },
//     //         get(target, property) {
//     //             // return a new proxy if possible, add to prefix
//     //             const out = target[property];
//     //             if (out instanceof Object) {
//     //                 return buildProxy(out);
//     //             }
//     //             return out;  // primitive, ignore
//     //         },
//     //     });
//     // }
//
//     // return buildProxy(obj);
//
// };
