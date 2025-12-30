import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  MessageSquare, 
  ArrowLeft, 
  Settings as SettingsIcon,
  Save,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface IntegrationConfig {
  platform: string;
  webhookUrl: string;
  workflowEnabled: boolean;
  icon: string;
  color: string;
}

const Settings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([
    { platform: "Facebook Messenger", webhookUrl: "", workflowEnabled: true, icon: "💬", color: "bg-blue-500" },
    { platform: "WhatsApp", webhookUrl: "", workflowEnabled: false, icon: "📱", color: "bg-green-500" },
    { platform: "Telegram", webhookUrl: "", workflowEnabled: true, icon: "✈️", color: "bg-sky-500" },
    { platform: "Slack", webhookUrl: "", workflowEnabled: true, icon: "💼", color: "bg-purple-500" },
  ]);

  const handleWebhookChange = (index: number, value: string) => {
    const newIntegrations = [...integrations];
    newIntegrations[index].webhookUrl = value;
    setIntegrations(newIntegrations);
  };

  const handleWorkflowToggle = (index: number) => {
    const newIntegrations = [...integrations];
    newIntegrations[index].workflowEnabled = !newIntegrations[index].workflowEnabled;
    setIntegrations(newIntegrations);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate save
    setTimeout(() => {
      toast({
        title: "Settings saved",
        description: "Your integration settings have been updated successfully."
      });
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <SettingsIcon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Integration Settings</h1>
                  <p className="text-sm text-muted-foreground">Connect messaging apps via API webhooks</p>
                </div>
              </div>
            </div>
            <Button variant="hero" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* n8n Integration Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 mb-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-2xl">
                ⚡
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground mb-1">n8n Workflow Integration</h2>
                <p className="text-muted-foreground text-sm mb-3">
                  All webhook data will be sent to your n8n workflow via POST request with the following payload structure:
                </p>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                  <code className="text-foreground">
                    {`{ platform, sender, message, timestamp, workflowEnabled }`}
                  </code>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Platform Integrations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Platform Integrations</h3>
            
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.platform}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                    integration.color + "/20"
                  )}>
                    {integration.icon}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{integration.platform}</h4>
                        <p className="text-sm text-muted-foreground">
                          {integration.webhookUrl ? "Connected" : "Not connected"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label htmlFor={`workflow-${index}`} className="text-sm text-muted-foreground">
                          Enable Workflow
                        </Label>
                        <Switch
                          id={`workflow-${index}`}
                          checked={integration.workflowEnabled}
                          onCheckedChange={() => handleWorkflowToggle(index)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`webhook-${index}`} className="text-sm text-foreground">
                        Webhook URL
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={`webhook-${index}`}
                          placeholder={`https://n8n.example.com/webhook/${integration.platform.toLowerCase().replace(' ', '-')}`}
                          value={integration.webhookUrl}
                          onChange={(e) => handleWebhookChange(index, e.target.value)}
                          className="flex-1"
                        />
                        <Button variant="outline" size="icon">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {integration.webhookUrl && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Webhook configured and ready</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Documentation Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-muted-foreground text-sm">
              Need help setting up webhooks?{" "}
              <a href="#" className="text-primary hover:underline">
                Read our documentation
              </a>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
