import { Handle, Position, type NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CustomNode = ({ data, selected }: NodeProps) => {
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Passive Enum': return 'border-blue-500 shadow-blue-500/20';
            case 'Active Enum': return 'border-red-500 shadow-red-500/20';
            case 'Probing': return 'border-orange-500 shadow-orange-500/20';
            case 'Port Scanning': return 'border-emerald-500 shadow-emerald-500/20';
            case 'Fingerprinting': return 'border-purple-500 shadow-purple-500/20';
            case 'Visual Recon': return 'border-pink-500 shadow-pink-500/20';
            case 'Content Discovery': return 'border-yellow-500 shadow-yellow-500/20';
            case 'URL Extraction': return 'border-cyan-500 shadow-cyan-500/20';
            case 'Vulnerability Filtering': return 'border-rose-500 shadow-rose-500/20';
            default: return 'border-border';
        }
    };

    const categoryStyle = data.category ? getCategoryColor(data.category) : 'border-border';

    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} className="!bg-primary" />

            <Card className={`min-w-[200px] border bg-card text-card-foreground shadow-lg transition-all duration-300 ${categoryStyle} ${selected ? 'ring-2 ring-primary/50 !shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'hover:border-primary/50'}`}>
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg font-bold tracking-tight">{data.label}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                        {data.category || data.type || 'Step'}
                    </p>
                </CardContent>
            </Card>

            <Handle type="source" position={Position.Bottom} className="!bg-primary" />
        </div>
    );
};

export default CustomNode;
