// import Controller from './Controller';
// import Evented from './Evented';
// import View from './View';
// import './index.css';
// import Application from './Application';
// import ViewManager from './ViewManager';
// import Layer from './Layer';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// class DefaultView extends Evented implements View {    
//     private _name: string;
//     constructor (name: string) {
//         super();
//         this._name = name;        
//     }    
//     open(container: HTMLElement, model: any) {
//         container.innerHTML = '';        
//     }
//     close() {
        
//     }
// }

// class DefaultController extends Controller {
//     constructor(name:string) {
//         super(name);
//     }
// }

window.addEventListener('load', () => {
    let map = L.map(document.body);
    map.setView([51.505, -0.09], 13);
    // let controllers = new Map<string, Controller>();
    // controllers.set('default', new DefaultController('default'));
    // let views = new Map<string, View>();
    // views.set('default', new DefaultView('default'));
    // let app = new Application(['default'], controllers, views);    
    // app.start();    
});