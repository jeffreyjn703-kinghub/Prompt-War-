import re
import os

def clean_file(path, replacements):
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated {path}")

# 1. MobileNav.tsx
clean_file("frontend/src/components/MobileNav.tsx", [
    ("  Radar,\n", "")
])

# 2. Navbar.tsx
clean_file("frontend/src/components/Navbar.tsx", [
    ("  Sparkles,\n", ""),
    ("  UserCheck,\n", "")
])

# 3. Sidebar.tsx
clean_file("frontend/src/components/Sidebar.tsx", [
    ("  Sparkles,\n", "")
])

# 4. TopBar.tsx
clean_file("frontend/src/components/TopBar.tsx", [
    ("  Sparkles,\n", ""),
    ("  AlertTriangle,\n", "")
])

# 5. ReplanBanner.tsx
clean_file("frontend/src/components/ReplanBanner.tsx", [
    ("  CheckCircle2,\n", ""),
    ("  ChevronDown,\n", ""),
    ("  const isGoal = type === 'GOAL_CHANGED';\n", "")
])

# 6. SkillDetailPanel.tsx
clean_file("frontend/src/components/SkillDetailPanel.tsx", [
    ("  UserCheck,\n", ""),
    ("  ArrowRight,\n", ""),
    ("  Layers,\n", ""),
    ("  Sparkles,\n", ""),
    ("  const [isLoading, setIsLoading] = useState(true);", "  const [, setIsLoading] = useState(true);")
])

# 7. AgentWorkingModal.tsx
clean_file("frontend/src/components/AgentWorkingModal.tsx", [
    ("  Activity,\n", "")
])

# 8. MarkdownContent.tsx
clean_file("frontend/src/components/MarkdownContent.tsx", [
    ("const remaining = line.slice(boldEnd + 2);", "// remaining text consumed inline")
])

# 9. orchestratorLocal.ts
clean_file("frontend/src/agents-local/orchestratorLocal.ts", [
    ("    const startTime = Date.now();\n", "")
])

# 10. curriculumPlanner.ts
clean_file("frontend/src/agents-local/curriculumPlanner.ts", [
    ("    const advancedSkills = prioritizedGaps.filter(g => (g.priority ?? 5) > 3);\n", "")
])

# 11. LandingPage.tsx
clean_file("frontend/src/pages/LandingPage.tsx", [
    ("  Bot,\n", ""),
    ("  CheckCircle2,\n", ""),
    ("  TrendingUp,\n", ""),
    ("  Award,\n", "")
])

# 12. OrgCohortPage.tsx
clean_file("frontend/src/pages/OrgCohortPage.tsx", [
    ("  Users,\n", ""),
    ("  TrendingUp,\n", ""),
    ("  CheckCircle2,\n", ""),
    ("  Briefcase,\n", ""),
    ("  ChevronRight,\n", ""),
    ("  ShieldAlert,\n", ""),
    ("  AlertCircle,\n", ""),
    ("  Clock,\n", ""),
    ("  Sparkles,\n", ""),
    ("  const [isLoading, setIsLoading] = useState(true);", "  const [, setIsLoading] = useState(true);")
])

# 13. ProgressPage.tsx
clean_file("frontend/src/pages/ProgressPage.tsx", [
    ("  Activity,\n", ""),
    ("  Layers,\n", ""),
    ("  ChevronRight,\n", ""),
    ("  Calendar,\n", ""),
    ("  const [isLoading, setIsLoading] = useState(true);", "  const [, setIsLoading] = useState(true);"),
    ("  const skillBars = progress?.phases_progress || [];\n", "")
])

# 14. CareerMatchPage.tsx
clean_file("frontend/src/pages/CareerMatchPage.tsx", [
    ("  ArrowRight,\n", ""),
    ("  ChevronRight,\n", ""),
    ("  TrendingUp,\n", ""),
    ("  Layers,\n", ""),
    ("  ArrowLeftRight,\n", ""),
    ("  const [isLoading, setIsLoading] = useState(true);", "  const [, setIsLoading] = useState(true);")
])

# 15. SkillAnalysisPage.tsx
clean_file("frontend/src/pages/SkillAnalysisPage.tsx", [
    ("  Filter,\n", ""),
    ("  Layers,\n", ""),
    ("  Sparkles,\n", ""),
    ("  TrendingUp,\n", ""),
    ("  const [isLoading, setIsLoading] = useState(true);", "  const [, setIsLoading] = useState(true);")
])

# 16. DashboardPage.tsx
clean_file("frontend/src/pages/DashboardPage.tsx", [
    ("  TrendingUp,\n", ""),
    ("  Layers,\n", ""),
    ("  HelpCircle,\n", ""),
    ("  const [isLoading, setIsLoading] = useState(true);", "  const [, setIsLoading] = useState(true);")
])

# 17. SettingsPage.tsx
clean_file("frontend/src/pages/SettingsPage.tsx", [
    ("  GraduationCap,\n", ""),
    ("  Briefcase,\n", ""),
    ("  Clock,\n", ""),
    ("  Bell,\n", ""),
    ("  const [notifWeekly, setNotifWeekly] = useState(true);\n", "")
])

# 18. ProfilePage.tsx
clean_file("frontend/src/pages/ProfilePage.tsx", [
    ("  AlertCircle,\n", ""),
    ("  ExternalLink,\n", ""),
    ("  TrendingUp,\n", ""),
    ("  const [availableRoles, setAvailableRoles] = useState<RoleTaxonomyItem[]>([]);\n", "")
])

# 19. OnboardingWizard.tsx
clean_file("frontend/src/pages/OnboardingWizard.tsx", [
    ("  Briefcase,\n", ""),
    ("  Clock,\n", ""),
    ("  Sliders,\n", ""),
    ("  Award,\n", ""),
    ("  FolderGit2,\n", ""),
    ("  Zap,\n", "")
])
