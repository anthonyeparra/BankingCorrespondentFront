import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import type { Correspondent } from "@/lib/data"
import Link from "next/link"

interface CorrespondentCardProps {
  correspondent: Correspondent
}

export function CorrespondentCard({ correspondent }: CorrespondentCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle>{correspondent.name}</CardTitle>
        <CardDescription className="flex items-center gap-1 mt-1">
          <MapPin className="h-3.5 w-3.5" />
          <span>{correspondent.address}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Código:</span>
            <span>{correspondent.correspondent_id}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/correspondent/${correspondent.correspondent_id}`} className="w-full">
          <Button className="w-full">Seleccionar</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

