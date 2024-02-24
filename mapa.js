var map = L.map('map').setView([6.5519, -74.7873], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

map.on('click', function(e) {
    var nuevaCoordenada = e.latlng;
    var nuevoMarcador = L.marker(nuevaCoordenada).addTo(map);
    var popupContent = '<form id="popupForm">' +
                        'Texto: <input type="text" name="texto"><br>' +
                        'Imagen URL: <input type="text" name="imagen"><br>' +
                        '<input type="submit" value="Guardar">' +
                        '</form>';
    nuevoMarcador.bindPopup(popupContent);

    document.getElementById('popupForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Evitar la recarga de la página

        var texto = this.elements.texto.value;
        var imagen = this.elements.imagen.value;
        nuevoMarcador.bindPopup(texto + '<br><img src="' + imagen + '" width="100">');
        
        fetch('http://localhost:3000/markers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                latlng: nuevaCoordenada,
                texto: texto,
                imagen: imagen
            })
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));

        return false; // Evita que la página se reinicie
    });
});
