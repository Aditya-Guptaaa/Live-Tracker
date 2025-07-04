const socket = io()
const markers = {}
const paths = {}
const useColors= {}
function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

const username = prompt("Enter your name")


const map = L.map("map").setView([0, 0], 16)

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap"
}).addTo(map)


if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords
            socket.emit("send-location",
                 { latitude,
                     longitude ,
                     username,
                     })
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
    const { id,username, latitude, longitude} = data
    const LatLng = [latitude, longitude]
    map.setView([latitude, longitude])
    if (markers[id]) {
        markers[id].setLatLng(LatLng)
         paths[id].addLatLng(LatLng)
    }
    else {
         useColors[id] = getRandomColor()  
        markers[id] = L.marker(LatLng).addTo(map).bindPopup(`<b>${username}</b>`).openPopup()
        paths[id] = L.polyline([LatLng], {
            color: useColors[id],     // Change to any color you like
            weight: 3,
            opacity: 0.7
        }).addTo(map)
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
    if (paths[id]) {
    map.removeLayer(paths[id])
    delete paths[id]
}
  if (useColors[id]) {
        delete useColors[id]
    }
})


const chatInput = document.getElementById("chat-input")
const messagesDiv = document.getElementById("messages")

chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && chatInput.value.trim() !== "") {
        socket.emit("chat-message", {
            username,
            message: chatInput.value.trim(),
            isYou: true
        })
        chatInput.value = ""
    }
})

socket.on("chat-message", ({ username: sender, message }) => {
    const msg = document.createElement("div")
    msg.className = "message"
    if (sender === username) msg.classList.add("you")

    msg.innerHTML = `<strong>${sender}</strong>: ${message}`
    messagesDiv.appendChild(msg)

    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight
})


