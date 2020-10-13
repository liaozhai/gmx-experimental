import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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