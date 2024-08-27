// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

import { Component } from '@angular/core';

import { AlertService, DialogType, MessageSeverity } from '../../services/alert.service';
import { ConfigurationService } from '../../services/configuration.service';
import { AppTranslationService } from '../../services/app-translation.service';
import { AccountService } from '../../services/account.service';
import { ThemeManager } from '../../services/theme-manager';
import { Utilities } from '../../services/utilities';
import { Permissions } from '../../models/permission.model';


@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrl: './user-preferences.component.scss'
})
export class UserPreferencesComponent {
  constructor(
    private alertService: AlertService,
    private translationService: AppTranslationService,
    private accountService: AccountService,
    public themeManager: ThemeManager,
    public configurations: ConfigurationService) {
  }

  reloadFromServer() {
    this.alertService.startLoadingMessage();

    this.accountService.getUserPreferences()
      .subscribe({
        next: results => {
          this.alertService.stopLoadingMessage();

          this.configurations.import(results);

          this.alertService.showMessage('Defaults loaded!', '', MessageSeverity.info);
        },
        error: error => {
          this.alertService.stopLoadingMessage();
          this.alertService.showStickyMessage('Load Error',
            `Unable to retrieve user preferences from the server.\r\nError: "${Utilities.getHttpResponseMessage(error)}"`,
            MessageSeverity.error, error);
        }
      });
  }

  setAsDefault() {
    this.alertService.showDialog('Are you sure you want to set the current configuration as your new defaults?', DialogType.confirm,
      () => this.setAsDefaultHelper(),
      () => this.alertService.showMessage('Operation Cancelled!', '', MessageSeverity.default));
  }

  setAsDefaultHelper() {
    this.alertService.startLoadingMessage('', 'Saving new defaults');

    this.accountService.updateUserPreferences(this.configurations.export())
      .subscribe({
        next: () => {
          this.alertService.stopLoadingMessage();
          this.alertService.showMessage('New Defaults', 'Account defaults updated successfully', MessageSeverity.success);
        },
        error: error => {
          this.alertService.stopLoadingMessage();
          this.alertService.showStickyMessage('Save Error',
            `An error occurred whilst saving configuration defaults.\r\nError: "${Utilities.getHttpResponseMessage(error)}"`,
            MessageSeverity.error, error);
        }
      });
  }

  resetDefault() {
    this.alertService.showDialog('Are you sure you want to reset your defaults?', DialogType.confirm,
      () => this.resetDefaultHelper(),
      () => this.alertService.showMessage('Operation Cancelled!', '', MessageSeverity.default));
  }

  resetDefaultHelper() {
    this.alertService.startLoadingMessage('', 'Resetting defaults');

    this.accountService.updateUserPreferences(null)
      .subscribe({
        next: () => {
          this.alertService.stopLoadingMessage();
          this.configurations.import(null);
          this.alertService.showMessage('Defaults Reset', 'Account defaults reset completed successfully', MessageSeverity.success);
        },
        error: error => {
          this.alertService.stopLoadingMessage();
          this.alertService.showStickyMessage('Save Error',
            `An error occurred whilst resetting configuration defaults.\r\nError: "${Utilities.getHttpResponseMessage(error)}"`,
            MessageSeverity.error, error);
        }
      });
  }

  get canViewCustomers() {
    return this.accountService.userHasPermission(Permissions.viewUsers); // eg. viewCustomersPermission
  }

  get canViewProducts() {
    return this.accountService.userHasPermission(Permissions.viewUsers); // eg. viewProductsPermission
  }

  get canViewOrders() {
    return true; // eg. viewOrdersPermission
  }
}
