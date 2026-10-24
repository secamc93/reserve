import { BusinessTypesPage } from '@/services/auth/business-types/ui';
import { IamPage, IamPageHeader } from '@/shared/ui/iam-navigation';

export default function IAMBusinessTypesPage() {
  return (
    <IamPage>
      <IamPageHeader title="Tipos de negocio" description="Clasifican las propiedades y filtran qué roles y permisos aplican a cada una." />
      <BusinessTypesPage />
    </IamPage>
  );
}
