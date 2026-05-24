export const TOUR_DATA = {
    initial_room: "living_room",
    rooms: {
        living_room: {
            title: "Luxurious Living Room",
            description: "Spacious layout showcasing premium hardwood floors and custom lighting.",
            image: "/tour_assets/living_room.jpg",
            mapX: 45, // Map percentage coordinates
            mapY: 65,
            hotspots: [
                { text: "Master Bedroom ⏭️", target: "bedroom", yaw: 45, pitch: -2 },
                { text: "Gourmet Kitchen 🍳", target: "kitchen", yaw: -95, pitch: -5 }
            ],
            infoTags: [
                { title: "Hardwood Aesthetics", text: "Imported white oak panels sealed with matte scratch-resistant glaze.", yaw: 10, pitch: -25 }
            ]
        },
        bedroom: {
            title: "Master Bedroom",
            description: "King-sized layout featuring floor-to-ceiling panoramic glass windows.",
            image: "/tour_assets/bed_room.jpg",
            mapX: 75,
            mapY: 35,
            hotspots: [
                { text: "Return to Living Room 🏠", target: "living_room", yaw: 180, pitch: 2 }
            ],
            infoTags: [
                { title: "Smart Glazing Glass", text: "Triple-pane tempered thermal barrier with automatic UV UV filtering opacity presets.", yaw: -45, pitch: 10 }
            ]
        },
        kitchen: {
            title: "Gourmet Kitchen",
            description: "State-of-the-art culinary space equipped with built-in smart appliances.",
            image: "/tour_assets/kitchen.jpg",
            mapX: 20,
            mapY: 30,
            hotspots: [
                { text: "Return to Living Room 🏠", target: "living_room", yaw: 115, pitch: 0 }
            ],
            infoTags: [
                { title: "Quartz Countertops", text: "Seamless, non-porous antimicrobial engineered stone surface.", yaw: 0, pitch: -20 }
            ]
        }
    }
};