// Hengsel – tokens for SwiftUI. GENERERT fra hengsel-palett.tokens.json (2026-10-14). Ikke rediger for hånd.
//
// Status:
//   Grunnpalett lys, mørk og økt kontrast ........ BESLUTTET
//   Plattformlag iPhone/iPad (Plattform) .......... FORESLÅTT (prinsippet systemflater + Liquid Glass er besluttet)
//
// Verdiene er sRGB. Asset-katalogen i Hengsel.xcassets har de samme fargene i Display P3 og kan brukes i stedet.
import SwiftUI
import UIKit

private func dyn(_ lys: UIColor, _ mork: UIColor, hc: UIColor? = nil, hcMork: UIColor? = nil) -> Color {
    Color(UIColor { t in
        let m = t.userInterfaceStyle == .dark
        if t.accessibilityContrast == .high { return m ? (hcMork ?? mork) : (hc ?? lys) }
        return m ? mork : lys
    })
}

/// Grunnpaletten. BESLUTTET. På iOS brukes bare aksent, statusfarger og merket direkte (se Plattform).
enum HengselTokens {
    static let flateSide = dyn(UIColor(red: 0.9647, green: 0.9725, blue: 0.9843, alpha: 1), UIColor(red: 0.0431, green: 0.0510, blue: 0.0667, alpha: 1), hc: UIColor(red: 0.9647, green: 0.9725, blue: 0.9843, alpha: 1), hcMork: UIColor(red: 0.0431, green: 0.0510, blue: 0.0667, alpha: 1))
    static let flateKort = dyn(UIColor(red: 0.9843, green: 0.9922, blue: 1.0000, alpha: 1), UIColor(red: 0.0667, green: 0.0784, blue: 0.0941, alpha: 1), hc: UIColor(red: 0.9843, green: 0.9922, blue: 1.0000, alpha: 1), hcMork: UIColor(red: 0.0667, green: 0.0784, blue: 0.0941, alpha: 1))
    static let flateSenket = dyn(UIColor(red: 0.9373, green: 0.9451, blue: 0.9569, alpha: 1), UIColor(red: 0.0235, green: 0.0314, blue: 0.0431, alpha: 1), hc: UIColor(red: 0.9373, green: 0.9451, blue: 0.9569, alpha: 1), hcMork: UIColor(red: 0.0235, green: 0.0314, blue: 0.0431, alpha: 1))
    static let flateValgt = dyn(UIColor(red: 0.8784, green: 0.9569, blue: 0.9333, alpha: 1), UIColor(red: 0.0745, green: 0.2000, blue: 0.1765, alpha: 1), hc: UIColor(red: 0.8784, green: 0.9569, blue: 0.9333, alpha: 1), hcMork: UIColor(red: 0.0745, green: 0.2000, blue: 0.1765, alpha: 1))
    static let linje = dyn(UIColor(red: 0.8431, green: 0.8549, blue: 0.8706, alpha: 1), UIColor(red: 0.1882, green: 0.2039, blue: 0.2235, alpha: 1), hc: UIColor(red: 0.6039, green: 0.6235, blue: 0.6471, alpha: 1), hcMork: UIColor(red: 0.3490, green: 0.3686, blue: 0.3961, alpha: 1))
    static let kant = dyn(UIColor(red: 0.4824, green: 0.5059, blue: 0.5333, alpha: 1), UIColor(red: 0.4157, green: 0.4353, blue: 0.4627, alpha: 1), hc: UIColor(red: 0.2863, green: 0.3059, blue: 0.3294, alpha: 1), hcMork: UIColor(red: 0.6510, green: 0.6706, blue: 0.6941, alpha: 1))
    static let tekst = dyn(UIColor(red: 0.1020, green: 0.1137, blue: 0.1333, alpha: 1), UIColor(red: 0.9176, green: 0.9294, blue: 0.9412, alpha: 1), hc: UIColor(red: 0.0157, green: 0.0235, blue: 0.0314, alpha: 1), hcMork: UIColor(red: 0.9882, green: 0.9922, blue: 1.0000, alpha: 1))
    static let tekstDempet = dyn(UIColor(red: 0.3176, green: 0.3373, blue: 0.3608, alpha: 1), UIColor(red: 0.6784, green: 0.6941, blue: 0.7176, alpha: 1), hc: UIColor(red: 0.1647, green: 0.1804, blue: 0.2000, alpha: 1), hcMork: UIColor(red: 0.8588, green: 0.8706, blue: 0.8863, alpha: 1))
    static let tekstSvak = dyn(UIColor(red: 0.4078, green: 0.4314, blue: 0.4588, alpha: 1), UIColor(red: 0.5255, green: 0.5451, blue: 0.5725, alpha: 1), hc: UIColor(red: 0.2627, green: 0.2824, blue: 0.3059, alpha: 1), hcMork: UIColor(red: 0.7529, green: 0.7686, blue: 0.7922, alpha: 1))
    static let tekstInvers = dyn(UIColor(red: 0.9843, green: 0.9922, blue: 1.0000, alpha: 1), UIColor(red: 0.0431, green: 0.0510, blue: 0.0667, alpha: 1), hc: UIColor(red: 0.9843, green: 0.9922, blue: 1.0000, alpha: 1), hcMork: UIColor(red: 0.0431, green: 0.0510, blue: 0.0667, alpha: 1))
    static let aksent = dyn(UIColor(red: 0.0235, green: 0.5176, blue: 0.4471, alpha: 1), UIColor(red: 0.3294, green: 0.7255, blue: 0.6471, alpha: 1), hc: UIColor(red: 0.0000, green: 0.4157, blue: 0.3569, alpha: 1), hcMork: UIColor(red: 0.4078, green: 0.8039, blue: 0.7176, alpha: 1))
    static let aksentTrykk = dyn(UIColor(red: 0.0000, green: 0.4627, blue: 0.3961, alpha: 1), UIColor(red: 0.3882, green: 0.7843, blue: 0.7020, alpha: 1), hc: UIColor(red: 0.0000, green: 0.3569, blue: 0.3020, alpha: 1), hcMork: UIColor(red: 0.4588, green: 0.8549, blue: 0.7686, alpha: 1))
    static let aksentTekst = dyn(UIColor(red: 0.0039, green: 0.4275, blue: 0.3686, alpha: 1), UIColor(red: 0.5412, green: 0.8039, blue: 0.7451, alpha: 1), hc: UIColor(red: 0.0000, green: 0.3059, blue: 0.2588, alpha: 1), hcMork: UIColor(red: 0.7059, green: 0.9255, blue: 0.8706, alpha: 1))
    static let aksentSvak = dyn(UIColor(red: 0.8784, green: 0.9569, blue: 0.9333, alpha: 1), UIColor(red: 0.0667, green: 0.1569, blue: 0.1373, alpha: 1), hc: UIColor(red: 0.8784, green: 0.9569, blue: 0.9333, alpha: 1), hcMork: UIColor(red: 0.0667, green: 0.1569, blue: 0.1373, alpha: 1))
    static let aksentValgt = dyn(UIColor(red: 0.7373, green: 0.9020, blue: 0.8588, alpha: 1), UIColor(red: 0.0863, green: 0.2471, blue: 0.2157, alpha: 1), hc: UIColor(red: 0.6667, green: 0.8667, blue: 0.8157, alpha: 1), hcMork: UIColor(red: 0.0980, green: 0.2941, blue: 0.2549, alpha: 1))
    static let paaAksent = dyn(UIColor(red: 1.0000, green: 1.0000, blue: 1.0000, alpha: 1), UIColor(red: 0.0510, green: 0.0627, blue: 0.0745, alpha: 1), hc: UIColor(red: 1.0000, green: 1.0000, blue: 1.0000, alpha: 1), hcMork: UIColor(red: 0.0510, green: 0.0627, blue: 0.0745, alpha: 1))
    static let varselFlate = dyn(UIColor(red: 1.0000, green: 0.9137, blue: 0.7373, alpha: 1), UIColor(red: 0.2392, green: 0.1647, blue: 0.0000, alpha: 1), hc: UIColor(red: 1.0000, green: 0.9647, blue: 0.8941, alpha: 1), hcMork: UIColor(red: 0.1451, green: 0.0941, blue: 0.0000, alpha: 1))
    static let varselTekst = dyn(UIColor(red: 0.4275, green: 0.3137, blue: 0.0000, alpha: 1), UIColor(red: 0.9882, green: 0.7882, blue: 0.3490, alpha: 1), hc: UIColor(red: 0.3137, green: 0.2235, blue: 0.0000, alpha: 1), hcMork: UIColor(red: 1.0000, green: 0.9137, blue: 0.7373, alpha: 1))
    static let feilFlate = dyn(UIColor(red: 1.0000, green: 0.9216, blue: 0.9098, alpha: 1), UIColor(red: 0.2588, green: 0.1098, blue: 0.0941, alpha: 1), hc: UIColor(red: 1.0000, green: 0.9569, blue: 0.9490, alpha: 1), hcMork: UIColor(red: 0.1922, green: 0.0510, blue: 0.0392, alpha: 1))
    static let feilTekst = dyn(UIColor(red: 0.6196, green: 0.1765, blue: 0.1569, alpha: 1), UIColor(red: 1.0000, green: 0.7490, blue: 0.7137, alpha: 1), hc: UIColor(red: 0.4706, green: 0.0000, blue: 0.0275, alpha: 1), hcMork: UIColor(red: 1.0000, green: 0.8941, blue: 0.8784, alpha: 1))
    static let merkeBlekk = dyn(UIColor(red: 0.1137, green: 0.1412, blue: 0.1882, alpha: 1), UIColor(red: 0.9098, green: 0.9216, blue: 0.9451, alpha: 1))
    static let merkeStift = dyn(UIColor(red: 0.0235, green: 0.5176, blue: 0.4471, alpha: 1), UIColor(red: 0.3294, green: 0.7255, blue: 0.6471, alpha: 1))

    enum Status {
        static let nyFg = dyn(UIColor(red: 0.1020, green: 0.3412, blue: 0.6784, alpha: 1), UIColor(red: 0.7098, green: 0.8275, blue: 1.0000, alpha: 1), hc: UIColor(red: 0.0000, green: 0.2196, blue: 0.5098, alpha: 1), hcMork: UIColor(red: 0.8784, green: 0.9255, blue: 1.0000, alpha: 1))
        static let nyBg = dyn(UIColor(red: 0.9059, green: 0.9451, blue: 1.0000, alpha: 1), UIColor(red: 0.0824, green: 0.1608, blue: 0.2745, alpha: 1), hc: UIColor(red: 0.9490, green: 0.9686, blue: 1.0000, alpha: 1), hcMork: UIColor(red: 0.0275, green: 0.1020, blue: 0.2118, alpha: 1))
        static let nyKant = dyn(UIColor(red: 0.6275, green: 0.7765, blue: 1.0000, alpha: 1), UIColor(red: 0.2157, green: 0.3451, blue: 0.5412, alpha: 1), hc: UIColor(red: 0.2431, green: 0.4431, blue: 0.7373, alpha: 1), hcMork: UIColor(red: 0.4588, green: 0.6039, blue: 0.8157, alpha: 1))
        static let pagarFg = dyn(UIColor(red: 0.3608, green: 0.2745, blue: 0.6549, alpha: 1), UIColor(red: 0.8157, green: 0.7882, blue: 1.0000, alpha: 1), hc: UIColor(red: 0.2510, green: 0.1451, blue: 0.5176, alpha: 1), hcMork: UIColor(red: 0.9176, green: 0.9098, blue: 1.0000, alpha: 1))
        static let pagarBg = dyn(UIColor(red: 0.9373, green: 0.9333, blue: 1.0000, alpha: 1), UIColor(red: 0.1608, green: 0.1373, blue: 0.2667, alpha: 1), hc: UIColor(red: 0.9647, green: 0.9647, blue: 1.0000, alpha: 1), hcMork: UIColor(red: 0.1059, green: 0.0784, blue: 0.2039, alpha: 1))
        static let pagarKant = dyn(UIColor(red: 0.7647, green: 0.7333, blue: 0.9843, alpha: 1), UIColor(red: 0.3451, green: 0.3059, blue: 0.5294, alpha: 1), hc: UIColor(red: 0.4471, green: 0.3843, blue: 0.7176, alpha: 1), hcMork: UIColor(red: 0.5922, green: 0.5608, blue: 0.8000, alpha: 1))
        static let venterFg = dyn(UIColor(red: 0.3333, green: 0.3569, blue: 0.3922, alpha: 1), UIColor(red: 0.7922, green: 0.8235, blue: 0.8627, alpha: 1), hc: UIColor(red: 0.2196, green: 0.2431, blue: 0.2745, alpha: 1), hcMork: UIColor(red: 0.8941, green: 0.9255, blue: 0.9647, alpha: 1))
        static let venterBg = dyn(UIColor(red: 0.9137, green: 0.9451, blue: 0.9843, alpha: 1), UIColor(red: 0.1412, green: 0.1608, blue: 0.1922, alpha: 1), hc: UIColor(red: 0.9451, green: 0.9686, blue: 1.0000, alpha: 1), hcMork: UIColor(red: 0.0863, green: 0.1059, blue: 0.1333, alpha: 1))
        static let venterKant = dyn(UIColor(red: 0.7412, green: 0.7725, blue: 0.8118, alpha: 1), UIColor(red: 0.3216, green: 0.3490, blue: 0.3804, alpha: 1), hc: UIColor(red: 0.4196, green: 0.4471, blue: 0.4824, alpha: 1), hcMork: UIColor(red: 0.5725, green: 0.6000, blue: 0.6353, alpha: 1))
        static let sannsynligFg = dyn(UIColor(red: 0.5020, green: 0.2157, blue: 0.5490, alpha: 1), UIColor(red: 0.9529, green: 0.7255, blue: 0.9882, alpha: 1), hc: UIColor(red: 0.3725, green: 0.0745, blue: 0.4157, alpha: 1), hcMork: UIColor(red: 0.9843, green: 0.8824, blue: 1.0000, alpha: 1))
        static let sannsynligBg = dyn(UIColor(red: 0.9882, green: 0.9137, blue: 1.0000, alpha: 1), UIColor(red: 0.2118, green: 0.1176, blue: 0.2275, alpha: 1), hc: UIColor(red: 0.9961, green: 0.9529, blue: 1.0000, alpha: 1), hcMork: UIColor(red: 0.1529, green: 0.0588, blue: 0.1686, alpha: 1))
        static let sannsynligKant = dyn(UIColor(red: 0.8784, green: 0.6941, blue: 0.9059, alpha: 1), UIColor(red: 0.4353, green: 0.2745, blue: 0.4627, alpha: 1), hc: UIColor(red: 0.5804, green: 0.3333, blue: 0.6196, alpha: 1), hcMork: UIColor(red: 0.7020, green: 0.5255, blue: 0.7255, alpha: 1))
        static let ferdigFg = dyn(UIColor(red: 0.1216, green: 0.4275, blue: 0.0078, alpha: 1), UIColor(red: 0.6667, green: 0.8902, blue: 0.6196, alpha: 1), hc: UIColor(red: 0.0627, green: 0.2941, blue: 0.0000, alpha: 1), hcMork: UIColor(red: 0.7686, green: 0.9961, blue: 0.7176, alpha: 1))
        static let ferdigBg = dyn(UIColor(red: 0.8902, green: 0.9686, blue: 0.8706, alpha: 1), UIColor(red: 0.0902, green: 0.1882, blue: 0.0706, alpha: 1), hc: UIColor(red: 0.9137, green: 0.9961, blue: 0.8980, alpha: 1), hcMork: UIColor(red: 0.0353, green: 0.1294, blue: 0.0157, alpha: 1))
        static let ferdigKant = dyn(UIColor(red: 0.6471, green: 0.8275, blue: 0.6078, alpha: 1), UIColor(red: 0.2314, green: 0.3922, blue: 0.1961, alpha: 1), hc: UIColor(red: 0.2667, green: 0.5137, blue: 0.2078, alpha: 1), hcMork: UIColor(red: 0.4784, green: 0.6510, blue: 0.4431, alpha: 1))
        static let advarselFg = dyn(UIColor(red: 0.4275, green: 0.3137, blue: 0.0000, alpha: 1), UIColor(red: 0.9882, green: 0.7882, blue: 0.3490, alpha: 1), hc: UIColor(red: 0.3137, green: 0.2235, blue: 0.0000, alpha: 1), hcMork: UIColor(red: 1.0000, green: 0.9137, blue: 0.7373, alpha: 1))
        static let advarselBg = dyn(UIColor(red: 1.0000, green: 0.9137, blue: 0.7373, alpha: 1), UIColor(red: 0.2392, green: 0.1647, blue: 0.0000, alpha: 1), hc: UIColor(red: 1.0000, green: 0.9647, blue: 0.8941, alpha: 1), hcMork: UIColor(red: 0.1451, green: 0.0941, blue: 0.0000, alpha: 1))
        static let advarselKant = dyn(UIColor(red: 0.8784, green: 0.7529, blue: 0.4980, alpha: 1), UIColor(red: 0.4392, green: 0.3255, blue: 0.0431, alpha: 1), hc: UIColor(red: 0.5686, green: 0.4196, blue: 0.0000, alpha: 1), hcMork: UIColor(red: 0.7020, green: 0.5804, blue: 0.3294, alpha: 1))
        static let feilFg = dyn(UIColor(red: 0.6196, green: 0.1765, blue: 0.1569, alpha: 1), UIColor(red: 1.0000, green: 0.7490, blue: 0.7137, alpha: 1), hc: UIColor(red: 0.4706, green: 0.0000, blue: 0.0275, alpha: 1), hcMork: UIColor(red: 1.0000, green: 0.8941, blue: 0.8784, alpha: 1))
        static let feilBg = dyn(UIColor(red: 1.0000, green: 0.9216, blue: 0.9098, alpha: 1), UIColor(red: 0.2588, green: 0.1098, blue: 0.0941, alpha: 1), hc: UIColor(red: 1.0000, green: 0.9569, blue: 0.9490, alpha: 1), hcMork: UIColor(red: 0.1922, green: 0.0510, blue: 0.0392, alpha: 1))
        static let feilKant = dyn(UIColor(red: 0.9765, green: 0.6824, blue: 0.6471, alpha: 1), UIColor(red: 0.5137, green: 0.2588, blue: 0.2353, alpha: 1), hc: UIColor(red: 0.6941, green: 0.3098, blue: 0.2745, alpha: 1), hcMork: UIColor(red: 0.7922, green: 0.5137, blue: 0.4784, alpha: 1))
    }
}

/// Plattformlag for iPhone og iPad. FORESLÅTT.
/// Flater og tekst er systemfarger. Hengsel-fargene kommer inn som tint, statuspiller, valgt rad og merket.
enum Plattform {
    // Systemflater
    static let flateSide = Color(uiColor: .systemGroupedBackground)
    static let flateKort = Color(uiColor: .secondarySystemGroupedBackground)
    static let flateSenket = Color(uiColor: .tertiarySystemGroupedBackground)
    static let linje = Color(uiColor: .separator)
    static let tekst = Color(uiColor: .label)
    static let tekstDempet = dyn(UIColor(red: 0.3176, green: 0.3373, blue: 0.3608, alpha: 1), UIColor(red: 0.6784, green: 0.6941, blue: 0.7176, alpha: 1))
    static let aksent = dyn(UIColor(red: 0.0235, green: 0.5176, blue: 0.4471, alpha: 1), UIColor(red: 0.3294, green: 0.7255, blue: 0.6471, alpha: 1))
    static let aksentTekst = dyn(UIColor(red: 0.0039, green: 0.4275, blue: 0.3686, alpha: 1), UIColor(red: 0.3294, green: 0.7255, blue: 0.6471, alpha: 1))
    static let aksentValgt = dyn(UIColor(red: 0.7373, green: 0.9020, blue: 0.8588, alpha: 1), UIColor(red: 0.0863, green: 0.2471, blue: 0.2157, alpha: 1))
    static let paaAksent = dyn(UIColor(red: 1.0000, green: 1.0000, blue: 1.0000, alpha: 1), UIColor(red: 0.0510, green: 0.0627, blue: 0.0745, alpha: 1))
    static let sidefeltValgt = dyn(UIColor(red: 0.0235, green: 0.5176, blue: 0.4471, alpha: 1), UIColor(red: 0.0863, green: 0.2471, blue: 0.2157, alpha: 1))
    static let paaSidefeltValgt = dyn(UIColor(red: 1.0000, green: 1.0000, blue: 1.0000, alpha: 1), UIColor(red: 1.0000, green: 1.0000, blue: 1.0000, alpha: 1))
    // tekst-dempet: systemets secondaryLabel har 3,44:1 i lys. Se «Venter på Eirik».
    // aksent-tekst: tekstknapper rett på grå flate eller glass. Aksent har 4,14:1 på #F2F2F7.
    // sidefelt-valgt: valgt rad i iPad-sidefelt. Systemets hvit på #54B9A5 har 2,37:1 i mørk.

    static let radiusKort: CGFloat = 20
    static let radiusKnappStor: CGFloat = 28
    static let trykkMin: CGFloat = 44
    static let sidefeltBredde: CGFloat = 320
}
