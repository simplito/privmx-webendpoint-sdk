import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CryptoCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export function CryptoCard({ title, description, children }: CryptoCardProps) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
