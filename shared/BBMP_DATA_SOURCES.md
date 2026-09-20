# BBMP boundary source

The boundary asset `bbmp-wards-2023.geojson` is the 225-ward GeoJSON published by the BBMP 2023 delimitation service. The original WFS endpoint is documented in the OpenStreetMap Bengaluru ward-boundary discussion:

- Official delimitation site: http://bbmpdelimitation2023.com/
- Official WFS endpoint: http://15.206.187.37:8080/geoserver/bbmp/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bbmp%3AnewWards&maxFeatures=300&outputFormat=application%2Fjson
- Provenance discussion: https://community.openstreetmap.org/t/ward-boundaries-for-2023-delimitation-in-bengaluru/110938
- Operational mirror used to vendor the asset because the WFS endpoint returned an empty response in this environment: https://gist.githubusercontent.com/Vonter/1a31ff6c48e1418736c81651981c99e1/raw/BBMP_Wards_2023.geojson

The source reports 225 wards and uses WGS84 longitude/latitude coordinates. The vendored TypeScript module preserves ward IDs and English names and is used only for point-in-polygon assignment; it is not presented as a live BBMP API connection.
