const socket = io()
const markers = {}

const map = L.map("map").setView([0, 0], 16)

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap"
}).addTo(map)



if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords
            socket.emit("send-location", { latitude, longitude })
        },
        (error) => {
            console.log(error.message)
        },
        {
            enableHighAccuracy: true,
            timeout: 500,
            maximumAge: 0,

        })

} else {
    alert("Geolocation not supported");
}

socket.on("received-location", (data) => {
    const { id, latitude, longitude } = data
    const LatLng = [latitude, longitude]
    map.setView([latitude, longitude])
    if (markers[id]) {
        markers[id].setLatLng(LatLng)
    }
    else {
        markers[id] = L.marker(LatLng).addTo(map)
    }
    if (id === socket.id) {
        map.setView(LatLng, 16);
    }
})

socket.on("user-disconnect", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id])
        delete markers[id]
    }
})