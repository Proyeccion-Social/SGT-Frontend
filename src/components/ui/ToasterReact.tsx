import { Toaster } from "sileo";

interface Props {
    isLocal?: boolean;
}

export default function ToasterReact({ isLocal }: Props) {
    return (
        <div className={isLocal ? "local-toaster-wrapper" : ""}>
            <Toaster position="top-center" options={{
                styles: {title: "#ffffff", description: "#ffffff", badge: "#ffffff" }
            }}/>
        </div>
    )
}
