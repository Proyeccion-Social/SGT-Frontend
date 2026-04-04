import { Badge } from "@/components/reui/badge"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BellIcon } from 'lucide-react'



import { useEffect, useState } from "react"

export function NotificationDropDown() {

      const [notifications, setNotifications] = useState<any[]>([]);

        useEffect(() => {
    fetch("/api/notifications/inbox")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
        } else if (data && data.data && Array.isArray(data.data)) {
          setNotifications(data.data);
        } else {
          console.error("Expected array for notifications, received:", data);
          setNotifications([]);
        }
      })
      .catch(error => {
        console.error("Failed to fetch notifications", error);
        setNotifications([]);
      });
  }, []);

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="ghost"  size="icon" className="relative" >
            <BellIcon />
            <Badge
              variant="destructive"
              size="sm"
              className="absolute -top-1.5 -right-2 rounded-full px-1"
            >
              {notifications.filter((n: any) => n.read === false).length}
            </Badge>
          </Button>
        } />
        <DropdownMenuContent className="w-80 bg-[#FFFFFF]/90  text-black" align="end" side="right" sideOffset={15} >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificaciones</span>
              <button className="text-foreground text-xs font-normal underline-offset-2 hover:underline">
                Marcar todas como leídas
              </button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="overflow-y-auto max-h-80 no-scrollbar">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id} 
                  className="flex items-start gap-2 py-1"
                >
                  <div className="flex flex-1 flex-col gap-px ">
                    <p className="leading-snug">
                      <span className="font-medium">{notification.message}</span>{" "}
                      <span className="text-muted-foreground">
                        {/*notification.action}*/}
                      </span>{" "}
                      <span className="font-medium">{notification.createdAt}</span>
                    </p>
                    <span className="text-muted-foreground">
                      {notification.time}
                    </span>
                  </div>
                  {notification.unread && (
                    <span className="bg-primary mt-2 size-1.5 shrink-0 rounded-full" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
