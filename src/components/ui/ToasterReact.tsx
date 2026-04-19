import { Toaster } from "sileo";

export default function ToasterReact() {
    return (
        <div style={{position: "relative", zIndex: 9999999}}>
            <Toaster position="top-center" options={{
                styles: {title: "#ffffff", description: "#ffffff", badge: "#ffffff" }
            }}/>
        </div>
    )
}
