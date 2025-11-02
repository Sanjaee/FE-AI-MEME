import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

interface MaintenanceDialogProps {
  isOpen: boolean;
  onRetry?: () => void;
  twitterUrl?: string;
}

const MaintenanceDialog: React.FC<MaintenanceDialogProps> = ({
  isOpen,
  onRetry,
  twitterUrl = "https://x.com/zea518831422540",
}) => {
  if (!isOpen) return null;

  const handleTwitterClick = () => {
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 relative">
        <Card className="border-0 shadow-xl bg-black border-zinc-800">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-orange-600">
                  Under Maintenance
                </CardTitle>
              </div>
            </div>
            <CardDescription className="text-zinc-400">
              Our AI model for token analysis is temporarily down. Please try again in a few moments.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-zinc-400 leading-relaxed">
                We apologize for the inconvenience. Our AI analysis engine is currently undergoing maintenance to improve performance and accuracy.
              </p>
              <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                Our technical team is actively working to restore full functionality. The service will be back online shortly.
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed pt-2">
                For more information, click on X.com
              </p>
            </div>
            <div className="flex gap-2">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              )}
              <Button
                onClick={handleTwitterClick}
                variant="outline"
                className="flex-1 border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                aria-label="Visit Twitter"
              >
                <FaXTwitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceDialog;

