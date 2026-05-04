import InstaBg from "../assets/imgs/InstaBg.png"
import TikTokBg from "../assets/imgs/TikTokBg.png"

import InstaIcon from "../assets/icons/Instagram.svg"
import TikTokIcon from "../assets/icons/TikTok.svg"
import LinkedInIcon from "../assets/icons/LinkedIn.svg"
import WhatsAppIcon from "../assets/icons/WhatsApp.svg"

export const COMMUNITY_CONSTS = {
    Instagram: {
        iconSrc: InstaIcon,
        bgSrc: InstaBg,
        url: "https://instagram.com/proysocialud",
        account: "@proysocialud",
        font: "Cabinet Grotesk Variable",
    },
    LinkedIn: {
        iconSrc: LinkedInIcon,
        bgSrc: null,
        url: "https://www.linkedin.com/company/proysocialud",
        account: "LinkedIn",
        font: "Open Sauce Two",
    },
    TikTok: {
        iconSrc: TikTokIcon,
        bgSrc: TikTokBg,
        url: "https://www.tiktok.com/@proysocialud",
        account: "@proysocialud",
        font: "Cabinet Grotesk Variable",
    },
    WhatsApp: {
        iconSrc: WhatsAppIcon,
        bgSrc: null,
        url: "https://wa.me/",
        account: "WhatsApp",
        font: "Open Sauce Two",
    },
}

