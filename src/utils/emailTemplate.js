export function verificationEmailTemplate(token) {
  return `<h1>Vérifiez votre email</h1>
          <p>Voici votre code de vérification : <strong>${token}</strong></p>`;
}

export function resetPasswordEmailTemplate(token) {
  return `<h1>Réinitialisation mot de passe</h1>
          <p>Voici votre code pour réinitialiser votre mot de passe : <strong>${token}</strong></p>`;
}
