from homeassistant import config_entries

DOMAIN = "centralino"

class CentralinoConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        # Non chiediamo nulla all’utente
        return self.async_create_entry(
            title="Centralino Manager",
            data={}
        )

