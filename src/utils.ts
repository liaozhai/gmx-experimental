import L, { LatLngBounds, LatLng, Point } from 'leaflet';

export default {
    getNormalizeBounds: function (screenBounds:LatLngBounds) { // get bounds array from -180 180 lng
        const northWest:LatLng = screenBounds.getNorthWest();
        const southEast:LatLng = screenBounds.getSouthEast();
        let minX = northWest.lng, maxX = southEast.lng;
        const w = (maxX - minX) / 2;
        let minX1:number = 0;
		let maxX1:number = 0;
		const out = [];

        if (w >= 180) {
            minX = -180; maxX = 180;
        } else if (maxX > 180 || minX < -180) {
            let center = ((maxX + minX) / 2) % 360;
            if (center > 180) { center -= 360; }
            else if (center < -180) { center += 360; }
            minX = center - w; maxX = center + w;
            if (minX < -180) {
                minX1 = minX + 360; maxX1 = 180; minX = -180;
            } else if (maxX > 180) {
                minX1 = -180; maxX1 = maxX - 360; maxX = 180;
            }
        }
        let m1:Point = L.Projection.Mercator.project(L.latLng([southEast.lat, minX]));
        let m2:Point = L.Projection.Mercator.project(L.latLng([northWest.lat, maxX]));
        out.push([m1.x, m1.y, m2.x, m2.y]);

        if (minX1) {
            let m11:Point = L.Projection.Mercator.project(L.latLng([southEast.lat, minX1]));
            let m12:Point = L.Projection.Mercator.project(L.latLng([northWest.lat, maxX1]));
            out.push([m11.x, m11.y, m12.x, m12.y]);
        }
        return out;
    },
};
