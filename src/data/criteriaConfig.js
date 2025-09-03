export const positions = [
  { value: 'reception', label: 'Réception' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'restauration', label: 'Restauration (Serveurs/Commis)' },
  { value: 'cuisine', label: 'Cuisine' },
  { value: 'maintenance', label: 'Maintenance/Techniciens' },
  { value: 'portiers', label: 'Portiers (Doormen/Bagagistes)' },
  { value: 'equipiers', label: 'Équipiers (Room Attendants/Public Areas)' },
  { value: 'plongeurs', label: 'Plongeurs (Stewards)' }
];

export const supervisorPositions = [
  { value: 'reception_manager', label: 'Responsable Réception' },
  { value: 'general_housekeeper', label: 'Gouvernante Générale' },
  { value: 'hr_director', label: 'Directeur des Ressources Humaines' },
  { value: 'head_accountant', label: 'Chef Comptable' },
  { value: 'maitre_hotel', label: "Maître d'Hôtel" },
  { value: 'head_chef', label: 'Chef de Cuisine' }
];

export const commonCriteria = [
  {
    id: 'ponctualite',
    label: 'Ponctualité & Assiduité',
    description: 'Respect des horaires, présence régulière'
  },
  {
    id: 'presentation',
    label: 'Présentation & Hygiène',
    description: 'Uniforme, propreté, posture'
  },
  {
    id: 'discipline',
    label: 'Discipline & Respect des règles',
    description: 'Suivi procédures, respect hiérarchie'
  },
  {
    id: 'esprit_equipe',
    label: "Esprit d'équipe",
    description: 'Collaboration, entraide'
  },
  {
    id: 'attitude_client',
    label: 'Attitude client',
    description: 'Politesse, courtoisie, respect'
  }
];

export const specificCriteria = {
  reception: [
    {
      id: 'pms',
      label: 'Connaissance PMS & Outils',
      description: 'Maîtrise du logiciel, check-in/check-out'
    },
    {
      id: 'vip',
      label: 'Gestion des clients VIP',
      description: 'Accueil personnalisé, suivi demandes spéciales'
    },
    {
      id: 'facturation',
      label: 'Exactitude de la facturation',
      description: 'Zéro erreur caisse, contrôle factures'
    },
    {
      id: 'plaintes',
      label: 'Gestion des plaintes',
      description: 'Réactivité, professionnalisme, résolution rapide'
    }
  ],
  housekeeping: [
    {
      id: 'proprete',
      label: 'Propreté des chambres',
      description: 'Respect des standards'
    },
    {
      id: 'rapidite',
      label: 'Rapidité & efficacité',
      description: 'Respect du timing ménage'
    },
    {
      id: 'gestion_produits',
      label: 'Gestion des produits & linge',
      description: 'Économie, pas de gaspillage'
    },
    {
      id: 'signalement',
      label: 'Signalement maintenance',
      description: 'Transmission rapide des anomalies'
    }
  ],
  restauration: [
    {
      id: 'service_salle',
      label: 'Service en salle',
      description: 'Rapidité, efficacité, courtoisie'
    },
    {
      id: 'menu_upselling',
      label: 'Connaissance du menu & upselling',
      description: 'Capacité à conseiller et vendre'
    },
    {
      id: 'mise_place',
      label: 'Mise en place & Dressage',
      description: 'Respect des standards'
    },
    {
      id: 'plaintes_resto',
      label: 'Gestion des plaintes clients',
      description: 'Réactivité, professionnalisme'
    }
  ],
  cuisine: [
    {
      id: 'qualite_gout',
      label: 'Qualité & Goût',
      description: 'Respect recettes, standards'
    },
    {
      id: 'presentation_plats',
      label: 'Présentation des plats',
      description: 'Esthétique, constance'
    },
    {
      id: 'hygiene_securite',
      label: 'Hygiène & Sécurité',
      description: 'HACCP, propreté du poste'
    },
    {
      id: 'gestion_stocks',
      label: 'Gestion des stocks & gaspillages',
      description: 'FIFO, contrôle pertes'
    }
  ],
  maintenance: [
    {
      id: 'reactivite',
      label: 'Réactivité aux demandes',
      description: "Rapidité d'intervention"
    },
    {
      id: 'qualite_reparations',
      label: 'Qualité des réparations',
      description: 'Travail durable, efficace'
    },
    {
      id: 'preventif',
      label: 'Préventif vs Correctif',
      description: 'Entretien anticipé'
    },
    {
      id: 'connaissances_tech',
      label: 'Connaissances techniques',
      description: 'Maîtrise électricité, plomberie, clim, etc.'
    },
    {
      id: 'communication_inter',
      label: 'Communication interservices',
      description: 'Rapports, suivi clair'
    }
  ],
  portiers: [
    {
      id: 'accueil_portier',
      label: 'Accueil & Présentation',
      description: 'Politesse, sourire, posture'
    },
    {
      id: 'gestion_bagages',
      label: 'Gestion bagages & véhicules',
      description: 'Rapidité, soin, sécurité'
    },
    {
      id: 'disponibilite',
      label: 'Disponibilité & proactivité',
      description: "Prise d'initiative, aide spontanée"
    },
    {
      id: 'connaissance_ville',
      label: "Connaissance de l'hôtel & ville",
      description: 'Infos utiles pour clients'
    },
    {
      id: 'coordination_reception',
      label: 'Coordination avec réception',
      description: 'Communication fluide'
    }
  ],
  equipiers: [
    {
      id: 'entretien_parties',
      label: 'Entretien des parties communes',
      description: 'Propreté des couloirs, lobby, ascenseurs'
    },
    {
      id: 'rapidite_equipe',
      label: 'Rapidité & efficacité',
      description: 'Tâches faites dans les délais'
    },
    {
      id: 'gestion_produits_equipe',
      label: 'Gestion des produits',
      description: 'Économie, bon dosage'
    },
    {
      id: 'signalement_anomalies',
      label: 'Signalement anomalies',
      description: 'Maintenance, sécurité, objets trouvés'
    }
  ],
  plongeurs: [
    {
      id: 'hygiene_vaisselle',
      label: 'Hygiène & propreté de la vaisselle',
      description: 'Zéro résidu, respect normes HACCP'
    },
    {
      id: 'utilisation_produits',
      label: 'Utilisation produits & machines',
      description: 'Soin, pas de gaspillage'
    },
    {
      id: 'rapidite_execution',
      label: "Rapidité d'exécution",
      description: 'Respect du flux service'
    },
    {
      id: 'proprete_zone',
      label: 'Propreté zone de plonge',
      description: 'Sols, équipements, sécurité'
    },
    {
      id: 'support_cuisine',
      label: 'Support à la cuisine',
      description: 'Disponibilité, flexibilité'
    }
  ]
};

export const supervisorTechnicalCriteria = [
  {
    id: 'gestion_equipe',
    label: 'Compétence en gestion d\'équipe',
    description: 'Capacité à diriger, motiver et coordonner l\'équipe'
  },
  {
    id: 'organisation_planification',
    label: 'Capacité d\'organisation et de planification',
    description: 'Structuration du travail, gestion des priorités'
  },
  {
    id: 'maitrise_procedures',
    label: 'Maîtrise des procédures de service',
    description: 'Connaissance et application des standards'
  },
  {
    id: 'suivi_indicateurs',
    label: 'Suivi des indicateurs de performance',
    description: 'Analyse des KPIs, tableaux de bord'
  },
  {
    id: 'reactivite_imprevus',
    label: 'Réactivité face aux imprévus',
    description: 'Gestion de crise, résolution de problèmes'
  },
  {
    id: 'formation_equipes',
    label: 'Capacité à former et encadrer les équipes',
    description: 'Transmission de compétences, coaching'
  }
];

export const supervisorBehavioralCriteria = [
  {
    id: 'leadership',
    label: 'Leadership et exemplarité',
    description: 'Influence positive, modèle pour l\'équipe'
  },
  {
    id: 'communication_equipe',
    label: 'Communication avec l\'équipe',
    description: 'Clarté, écoute, feedback constructif'
  },
  {
    id: 'relation_direction',
    label: 'Relation avec la direction',
    description: 'Reporting, alignement stratégique'
  },
  {
    id: 'collaboration_inter',
    label: 'Esprit de collaboration inter-départements',
    description: 'Transversalité, synergie'
  },
  {
    id: 'professionnalisme',
    label: 'Professionnalisme / Présentation',
    description: 'Image, tenue, comportement exemplaire'
  },
  {
    id: 'amelioration_continue',
    label: 'Implication dans l\'amélioration continue',
    description: 'Innovation, propositions, optimisation'
  }
];

export const appreciationScale = [
  { min: 90, max: 100, label: 'Excellent', color: 'text-green-600' },
  { min: 80, max: 89, label: 'Très Bon', color: 'text-blue-600' },
  { min: 70, max: 79, label: 'Bon', color: 'text-indigo-600' },
  { min: 60, max: 69, label: 'À améliorer', color: 'text-yellow-600' },
  { min: 0, max: 59, label: 'Insuffisant', color: 'text-red-600' }
];

export const supervisorAppreciationScale = [
  { min: 90, max: 100, label: 'Performance exceptionnelle', color: 'text-green-600', bonusEligible: 'Prime maximale' },
  { min: 80, max: 89, label: 'Très bonne performance', color: 'text-blue-600', bonusEligible: 'Prime standard' },
  { min: 70, max: 79, label: 'Bonne performance', color: 'text-indigo-600', bonusEligible: 'Prime réduite' },
  { min: 60, max: 69, label: 'Performance à améliorer', color: 'text-yellow-600', bonusEligible: 'Pas de prime' },
  { min: 0, max: 59, label: 'Performance insuffisante', color: 'text-red-600', bonusEligible: 'Pas de prime' }
];

export const decisions = [
  { id: 'prime', label: "Prime d'évaluation accordée" },
  { id: 'formation', label: 'Formation recommandée' },
  { id: 'disciplinaire', label: 'Suivi disciplinaire' },
  { id: 'promotion', label: 'Promotion / Évolution possible' }
];