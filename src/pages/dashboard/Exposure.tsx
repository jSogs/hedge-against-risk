import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Upload, TrendingUp, TrendingDown, AlertTriangle, DollarSign, FileText } from 'lucide-react';
import { getFinancialAnalysis } from '@/lib/api';
import { motion } from 'framer-motion';
import { FileUpload } from '@/components/onboarding/FileUpload';

export default function Exposure() {
  const { user, loading: authLoading } = useAuth();
  const [financialAnalysis, setFinancialAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchFinancialAnalysis();
    }
  }, [user, authLoading, navigate]);

  const fetchFinancialAnalysis = async () => {
    if (!user) return;
    
    setAnalysisLoading(true);
    try {
      const result = await getFinancialAnalysis(user.id);
      if (result.status === 'found') {
        setFinancialAnalysis(result.analysis);
      }
    } catch (error) {
      console.error('Error fetching financial analysis:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (authLoading || analysisLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!financialAnalysis) {
    return (
      <ScrollArea className="h-full w-full">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-semibold tracking-tight">Financial Exposure</h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              Upload financial documents to analyze your exposures and vulnerabilities
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-card border-border shadow-sm">
              <CardContent className="py-12">
                <div className="max-w-2xl mx-auto text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">No Financial Analysis Yet</h3>
                    <p className="text-muted-foreground">
                      Upload a financial document (bank statement, earnings report) to get AI-powered insights 
                      into your exposures, vulnerabilities, and personalized hedge recommendations.
                    </p>
                  </div>
                  <div className="max-w-lg mx-auto">
                    <FileUpload
                      userId={user!.id}
                      documentType="bank-statement"
                      onAnalysisComplete={() => {
                        fetchFinancialAnalysis();
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </ScrollArea>
    );
  }

  const { extracted_data, risk_analysis, document_name, analyzed_at } = financialAnalysis;

  return (
    <ScrollArea className="h-full w-full">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-semibold tracking-tight">Financial Exposure</h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            AI-powered analysis of your financial vulnerabilities and hedge opportunities
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Header with document info */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {document_name || 'Financial Document'}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Analyzed on {new Date(analyzed_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setShowUpload(!showUpload)}
                >
                  <Upload className="h-4 w-4" />
                  {showUpload ? 'Cancel' : 'Upload New Document'}
                </Button>
              </div>
            </CardHeader>
            {showUpload && (
              <CardContent className="border-t">
                <div className="pt-6">
                  <FileUpload
                    userId={user!.id}
                    documentType="bank-statement"
                    onAnalysisComplete={() => {
                      fetchFinancialAnalysis();
                      setShowUpload(false);
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Note: Uploading a new document will replace the current analysis. 
                    Support for multiple documents coming soon.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Analysis Summary */}
          {risk_analysis?.summary && (
            <Card className="bg-card border-border shadow-sm border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg">Risk Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{risk_analysis.summary}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Income Section */}
            {extracted_data?.income && (
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Income
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      ${extracted_data.income.amount?.toLocaleString() || 'N/A'}
                    </span>
                    {extracted_data.income.frequency && (
                      <span className="text-muted-foreground">/ {extracted_data.income.frequency}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Expenses Section */}
            {extracted_data?.expenses && (
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      ${extracted_data.expenses.amount?.toLocaleString() || 'N/A'}
                    </span>
                    {extracted_data.expenses.frequency && (
                      <span className="text-muted-foreground">/ {extracted_data.expenses.frequency}</span>
                    )}
                  </div>
                  {extracted_data.expenses.breakdown && (
                    <div className="pt-3 space-y-1">
                      {Object.entries(extracted_data.expenses.breakdown).map(([category, amount]: [string, any]) => (
                        <div key={category} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{category}:</span>
                          <span className="font-medium">${amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Vulnerabilities */}
          {risk_analysis?.vulnerabilities && risk_analysis.vulnerabilities.length > 0 && (
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Identified Vulnerabilities
                </CardTitle>
                <CardDescription>
                  Areas of financial risk that could benefit from hedging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {risk_analysis.vulnerabilities.map((vuln: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-primary/30 pl-4 py-2">
                      <h4 className="font-medium mb-1">{vuln.category}</h4>
                      <p className="text-sm text-muted-foreground">{vuln.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Categories */}
          {risk_analysis?.risk_categories && risk_analysis.risk_categories.length > 0 && (
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Risk Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {risk_analysis.risk_categories.map((category: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hedge Suggestions */}
          {risk_analysis?.hedge_suggestions && risk_analysis.hedge_suggestions.length > 0 && (
            <Card className="bg-card border-border shadow-sm border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg">Hedge Suggestions</CardTitle>
                <CardDescription>
                  Recommended strategies based on your exposure analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {risk_analysis.hedge_suggestions.map((suggestion: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">{idx + 1}</span>
                      </div>
                      <p className="text-sm flex-1">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </ScrollArea>
  );
}

