'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowsRightLeftIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  LightBulbIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface ModuleIntegration {
  module: string;
  status: 'connected' | 'disconnected' | 'error';
  aiFeatures: string[];
  lastSync: string;
  dataPoints: number;
}

interface AIInsight {
  id: string;
  module: string;
  type: 'warning' | 'opportunity' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionRequired: boolean;
}

export default function ModulesIntegration() {
  const [integrations, setIntegrations] = useState<ModuleIntegration[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Simulation des données d'intégration
    setIntegrations([
      {
        module: 'Rapprochement Bancaire',
        status: 'connected',
        aiFeatures: [
          'Détection automatique des correspondances',
          'Analyse des écarts récurrents',
          'Prédiction des flux de trésorerie',
          'Alertes d\'anomalies'
        ],
        lastSync: '2024-12-09 14:30:00',
        dataPoints: 1523
      },
      {
        module: 'États Financiers',
        status: 'connected',
        aiFeatures: [
          'Génération automatique selon OHADA/IFRS',
          'Analyse comparative multi-périodes',
          'Calcul intelligent des ratios',
          'Détection d\'incohérences',
          'Recommandations d\'amélioration'
        ],
        lastSync: '2024-12-09 14:28:00',
        dataPoints: 2847
      },
      {
        module: 'Déclarations Fiscales',
        status: 'connected',
        aiFeatures: [
          'Calcul automatique par pays OHADA',
          'Vérification de conformité',
          'Optimisation fiscale',
          'Calendrier intelligent des échéances',
          'Analyse des risques fiscaux'
        ],
        lastSync: '2024-12-09 14:25:00',
        dataPoints: 956
      }
    ]);

    // Simulation des insights IA
    setAiInsights([
      {
        id: 'insight_1',
        module: 'Rapprochement Bancaire',
        type: 'anomaly',
        title: 'Écart récurrent détecté',
        description: 'Un écart de 50 000 FCFA apparaît chaque mois sur le compte 512100. Cela pourrait indiquer une écriture automatique manquante.',
        confidence: 0.87,
        impact: 'medium',
        actionRequired: true
      },
      {
        id: 'insight_2',
        module: 'États Financiers',
        type: 'warning',
        title: 'Ratio de liquidité en baisse',
        description: 'Le ratio de liquidité générale est passé de 2.96 à 2.15 sur les 6 derniers mois. Attention au BFR.',
        confidence: 0.92,
        impact: 'high',
        actionRequired: true
      },
      {
        id: 'insight_3',
        module: 'Déclarations Fiscales',
        type: 'opportunity',
        title: 'Optimisation fiscale possible',
        description: 'En restructurant les amortissements au Burkina Faso, vous pourriez économiser environ 180 000 FCFA d\'impôts.',
        confidence: 0.75,
        impact: 'medium',
        actionRequired: false
      },
      {
        id: 'insight_4',
        module: 'États Financiers',
        type: 'recommendation',
        title: 'Amélioration de la rentabilité',
        description: 'La marge opérationnelle de 24.7% est excellente. Considérez une expansion en Côte d\'Ivoire pour capitaliser sur cette performance.',
        confidence: 0.68,
        impact: 'high',
        actionRequired: false
      },
      {
        id: 'insight_5',
        module: 'Rapprochement Bancaire',
        type: 'warning',
        title: 'Retard de rapprochement',
        description: 'Le rapprochement du compte Gabon n\'a pas été effectué depuis 15 jours. Des pénalités peuvent s\'appliquer.',
        confidence: 0.95,
        impact: 'high',
        actionRequired: true
      }
    ]);
  }, []);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulation de l'analyse IA
    setTimeout(() => {
      setIsAnalyzing(false);
      // Ajouter de nouveaux insights
      setAiInsights(prev => [...prev, {
        id: `insight_${Date.now()}`,
        module: 'Analyse Globale',
        type: 'recommendation',
        title: 'Nouvelle recommandation générée',
        description: 'L\'IA a identifié de nouvelles opportunités d\'optimisation basées sur vos données récentes.',
        confidence: 0.82,
        impact: 'medium',
        actionRequired: false
      }]);
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-50 border-green-200';
      case 'disconnected': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircleIcon className="h-4 w-4" />;
      case 'error': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <CpuChipIcon className="h-4 w-4" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />;
      case 'opportunity': return <LightBulbIcon className="h-5 w-5 text-blue-600" />;
      case 'anomaly': return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'recommendation': return <SparklesIcon className="h-5 w-5 text-purple-600" />;
      default: return <ChartBarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'opportunity': return 'border-blue-200 bg-blue-50';
      case 'anomaly': return 'border-red-200 bg-red-50';
      case 'recommendation': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const urgentInsights = aiInsights.filter(insight => insight.actionRequired && insight.impact === 'high');

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Intégration IA</h1>
          <p className="text-gray-600 mt-1">
            Connexion intelligente entre les modules et l'assistant IA
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="flex items-center space-x-2"
          >
            <SparklesIcon className="h-4 w-4" />
            <span>{isAnalyzing ? 'Analyse en cours...' : 'Lancer analyse IA'}</span>
          </Button>
        </div>
      </div>

      {/* Alertes urgentes */}
      {urgentInsights.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{urgentInsights.length} action(s) urgente(s) identifiée(s)</strong> par l'IA. 
            Intervention recommandée.
          </AlertDescription>
        </Alert>
      )}

      {/* Statut des intégrations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {integrations.map((integration, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {integration.module === 'Rapprochement Bancaire' && <ArrowsRightLeftIcon className="h-5 w-5" />}
                {integration.module === 'États Financiers' && <DocumentTextIcon className="h-5 w-5" />}
                {integration.module === 'Déclarations Fiscales' && <ClipboardDocumentListIcon className="h-5 w-5" />}
                <span className="text-sm">{integration.module}</span>
                <Badge className={`text-xs ${getStatusColor(integration.status)}`}>
                  <span className="flex items-center space-x-1">
                    {getStatusIcon(integration.status)}
                    <span>{integration.status === 'connected' ? 'Connecté' : 'Déconnecté'}</span>
                  </span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Fonctionnalités IA</h4>
                  <div className="space-y-1">
                    {integration.aiFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs">
                        <CheckCircleIcon className="h-3 w-3 text-green-600" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Points de données</span>
                    <span className="font-medium">{integration.dataPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Dernière sync</span>
                    <span>{new Date(integration.lastSync).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Modules connectés</p>
                <p className="text-2xl font-bold text-green-600">
                  {integrations.filter(i => i.status === 'connected').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  sur {integrations.length}
                </p>
              </div>
              <CpuChipIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Points de données</p>
                <p className="text-2xl font-bold text-blue-600">
                  {integrations.reduce((sum, i) => sum + i.dataPoints, 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Analysés par l'IA
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Insights générés</p>
                <p className="text-2xl font-bold text-purple-600">
                  {aiInsights.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Recommandations
                </p>
              </div>
              <SparklesIcon className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actions urgentes</p>
                <p className="text-2xl font-bold text-red-600">
                  {urgentInsights.length}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Nécessitent attention
                </p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights de l'IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SparklesIcon className="h-5 w-5" />
            <span>Insights Intelligents</span>
            <Badge variant="outline">{aiInsights.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.map((insight) => (
              <div key={insight.id} className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}>
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">{insight.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {insight.module}
                      </Badge>
                      <Badge className={`text-xs ${getImpactColor(insight.impact)}`}>
                        Impact {insight.impact}
                      </Badge>
                      {insight.actionRequired && (
                        <Badge variant="destructive" className="text-xs">
                          Action requise
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>Confiance IA:</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                            <div 
                              className="h-1.5 bg-blue-600 rounded-full" 
                              style={{ width: `${insight.confidence * 100}%` }}
                            />
                          </div>
                          <span className="font-medium">{Math.round(insight.confidence * 100)}%</span>
                        </div>
                      </div>
                      {insight.actionRequired && (
                        <Button size="sm" variant="outline">
                          Traiter
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions recommandées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LightBulbIcon className="h-5 w-5" />
            <span>Actions Recommandées</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 border rounded-lg bg-blue-50">
              <CheckCircleIcon className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">Configurer les alertes automatiques</h4>
                <p className="text-sm text-blue-700">
                  Activez les notifications IA pour être informé en temps réel des anomalies détectées.
                </p>
              </div>
              <Button size="sm" variant="outline">
                Configurer
              </Button>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg bg-green-50">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <h4 className="font-medium text-green-900">Optimiser les règles de rapprochement</h4>
                <p className="text-sm text-green-700">
                  L'IA a appris de vos validations. Mettez à jour les règles automatiques.
                </p>
              </div>
              <Button size="sm" variant="outline">
                Optimiser
              </Button>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg bg-purple-50">
              <CheckCircleIcon className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <h4 className="font-medium text-purple-900">Planifier l'analyse prédictive</h4>
                <p className="text-sm text-purple-700">
                  Programmez des analyses automatiques pour anticiper les tendances financières.
                </p>
              </div>
              <Button size="sm" variant="outline">
                Planifier
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}