import { useSettingsStore } from "@/store/settingsStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "./ThemeToggle";

export function SettingsForm() {
  const {
    arabicFontSize,
    translationFontSize,
    showTranslation,
    translationLanguage,
    reciter,
    setArabicFontSize,
    setTranslationFontSize,
    toggleTranslation,
    setTranslationLanguage,
    setReciter,
  } = useSettingsStore();

  const translations = [
    { value: "en.asad", label: "English" },
    { value: "bn.bengali", label: "Bangali" },
  ];

  const reciters = [
    { value: "ar.alafasy", label: "Mishary Rashid Alafasy" },
    { value: "ar.hudhaify", label: "Ali Al-Hudhaify" },
    { value: "ar.minshawi", label: "Mohamed Siddiq Al-Minshawi" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="theme">Theme</Label>
            <ThemeToggle />
          </div>

          <div className="space-y-2">
            <Label>Arabic Font Size</Label>
            <RadioGroup
              value={arabicFontSize}
              onValueChange={(value) => setArabicFontSize(value as "small" | "medium" | "large")}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="arabic-small" />
                <Label htmlFor="arabic-small">Small</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="arabic-medium" />
                <Label htmlFor="arabic-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="arabic-large" />
                <Label htmlFor="arabic-large">Large</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Translation Font Size</Label>
            <RadioGroup
              value={translationFontSize}
              onValueChange={(value) => setTranslationFontSize(value as "small" | "medium" | "large")}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="translation-small" />
                <Label htmlFor="translation-small">Small</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="translation-medium" />
                <Label htmlFor="translation-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="translation-large" />
                <Label htmlFor="translation-large">Large</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reading</CardTitle>
          <CardDescription>Configure your reading experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-translation">Show Translation</Label>
            <Switch id="show-translation" checked={showTranslation} onCheckedChange={toggleTranslation} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="translation">Translation</Label>
            <Select value={translationLanguage} onValueChange={setTranslationLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select translation" />
              </SelectTrigger>
              <SelectContent>
                {translations.map((translation) => (
                  <SelectItem key={translation.value} value={translation.value}>
                    {translation.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reciter">Reciter</Label>
            <Select value={reciter} onValueChange={setReciter}>
              <SelectTrigger>
                <SelectValue placeholder="Select reciter" />
              </SelectTrigger>
              <SelectContent>
                {reciters.map((reciter) => (
                  <SelectItem key={reciter.value} value={reciter.value}>
                    {reciter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
